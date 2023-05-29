import Dexie from 'dexie'
import { c } from '@wonderlandlabs/collect'
import validateData from '~/lib/store/validateData'
import { AsyncResponse, Engine, FieldDef, FieldQuery, IndexDbTables } from '~/lib/store/types'
import { sortBy } from 'lodash'

function matchingVersion(fieldDef: FieldDef, version: number) {
  return fieldVersion(fieldDef) === version;
}

const fieldVersion = (fieldDef: FieldDef) => 'version' in fieldDef ? fieldDef.version : 1

const indexedEngine = (config = {}): Engine => {
  const db = new Dexie('Planboard', config);

  function validate(collection: string, value: any, id: any) {
    let schema: FieldDef[] = engine.schema(collection);
    if (!schema) {
      return;
    }
    validateData(value, schema, collection);
  }

  let engine = {
    schemas: {},
    init: false,
    initialize() {
      if (engine.init) {
        return;
      }
      const tables = engine.tables();
      tables.forEach((versionTables, ver) => {
        // console.log('initializing version', ver, 'with tables:', versionTables);
        db.version(ver).stores(versionTables);
      })

      engine.rollSchemasForward();

      engine.init = true;
    },
    schema(collectionName: string) {
      const map = engine.schemas[collectionName];
      if (!map) throw new Error('no schema for ' + collectionName);
      return c(map).getReduce((memo, schema, version) => {
        if (!memo || (version > memo.version))  return {version, schema};
        return memo;
      }, null).schema;
    },
    rollSchemasForward() {
      const tables = engine.tables();
      const versions = Array.from(tables.keys()).sort();
      c(engine.schemas).forEach((tableDefMap, tableName) => {
        let lastVersion = null;
        for (const version of versions) {
          if (tableDefMap.has(version)) {
            lastVersion = tableDefMap.get(version);
          } else if (lastVersion) {
            tableDefMap.set(version, lastVersion);
          }
        }
      });
    },
    tables(): Map<number, IndexDbTables> {
      // refactors the schema (table(object) name -> Map<version,fields>) to
      // Map<version,IndexedDbTables>
      const tableMap = new Map();
      const tableNames = Object.keys(engine.schemas);
      tableNames.forEach((tableName) => {
        const tableSchemas = engine.schemas[tableName]
        tableSchemas.forEach((fieldList, version) => {
          if (!tableMap.has(version)) {
            tableMap.set(version, {});
          }
          tableMap.get(version)[tableName] = sortBy(fieldList, 'primary')
            .map((field) => field.name).join(',');
        });
      });
      // roll forward versions of tables that don't have definitions as high as other ones.
      tableMap.forEach((tableDef, version) => {
        let next = version + 1;
        while (tableMap.has(next)) {
          Object.keys(tableDef).forEach((tableName) => {
            const nextDef = tableMap.get(next);
            if (!(tableName in nextDef)) {
              nextDef[tableName] = tableDef[tableName];
            }
          });
          next += 1;
        }
      });
      return tableMap;
    },
    async query(collection: string, conditions: FieldQuery[]): Promise<AsyncResponse> {
      if (!(collection in db)) {
        return { error: new Error(`no table "${collection}"`) };
      }

      if (!conditions?.length) {
        const data = await db[collection].toArray();
        return { data }
      }

      try {
        const table = db[collection];
        if (!table) {
          throw new Error('no table ' + collection)
        }
        const coll = conditions.reduce((
          db: Dexie.Table | Dexie.Collection,
          condition, index
        ) => {
          try {
            if (index === 0) {
              //@ts-ignore
              return db.where(condition.field).equals(condition.value);
            } // else...
            //@ts-ignore
            db.and((item) => item[condition.field] === condition.value);
            return db;
          } catch (err) {
            console.warn('query error with condition', condition, ':', err);
            throw err;
          }
        }, table)
        const data = await coll.toArray();
        return { data };
      } catch (err) {
        console.warn('query error:', err, 'on', collection, 'with', conditions);
        return { error: err }
      }

    },
    async deleteIds(collection: string, ids: any[]) {
      await db[collection].bulkDelete(ids);
    },
    distribute(schema: FieldDef[]) {
      // sorted collection of fields ordered by versions;
      const coll = c(schema).sort((r1, r2) => {
        const diff = fieldVersion(r1) - fieldVersion(r2);
        return diff ? diff / Math.abs(diff) : diff;
      });

      const versions = Array.from(coll.getReduce((memo, fieldDef) => {
        memo.add(fieldVersion(fieldDef));
        return memo;
      }, new Set())); // array of numbers.

      const versionedFields = new Map();
      versions.forEach((version) => {
        const c2 = coll.getFilter((fieldDef) => {
          return fieldVersion(fieldDef) === version
        });
        versionedFields.set(version, c2);
      })
      return [versions, versionedFields];
    },
    addStore(collection: string, schema: FieldDef[] | undefined): void {
      if (!collection) {
        throw new Error('bad/empty store collection');
      }
      if (!Array.isArray(schema)) {
        throw new Error('bad schema definition for ' + collection);
      }
      const [versions, versionedFields] = engine.distribute(schema);

      const schemaByVersion = new Map();

      versionedFields.forEach((fieldList, versionNumber) => {
        const fieldMap = fieldList.reduce((memo, fieldDef: FieldDef) => {
          memo.set(fieldDef.name, fieldDef);
          return memo;
        }, new Map());

        schemaByVersion.set(versionNumber, fieldMap);
      });

      // forward field definitions to future version schemas

      schemaByVersion.forEach((fieldsMap, version) => {
        fieldsMap.forEach((fieldDef, fieldName) => {
          let nextVersion = version + 1;
          while (schemaByVersion.has(nextVersion)) {
            let nextSchema = schemaByVersion.get(nextVersion);
            if (nextSchema.has(fieldName)) {
              // field def is updated in this (and future) schemas
              return;
            }
            // otherwise, field definition carries on to the future schemas
            nextSchema.set(fieldName, fieldDef);
            nextVersion += 1;
          }
        });
      });


      // once inheritance has been achieved, flatten the field Map to a basic array of field definitions
      schemaByVersion.forEach((fieldDefMap, version) => {
        schemaByVersion.set(version, Array.from(fieldDefMap.values()))
      })

      engine.schemas[collection] = schemaByVersion;
    },
    async fetch(collection: string, id: any): Promise<AsyncResponse> {
      try {
        const data = await db[collection].get(id);
        validate(collection, data, id);
        return { data }
      } catch (error) {
        if (error instanceof Error) {
          return { error };
        }
        if (typeof error === 'string') {
          return { error: new Error(error) };
        }
        return { error: new Error('cannot fetch') };
      }
    },
    async save(collection: string, value: any, id: any): Promise<AsyncResponse> {
      validate(collection, value, id);
      try {
        await db[collection].put(value, id);
        return { data: value }
      } catch (error) {
        console.warn('error saving: ', value, id, error);
        return { error };
      }
    },
    async deleteId(collection: string, id: any) {
      return db[collection].delete(id);
    }
  }
  return engine
}
export default indexedEngine;

import Dexie from 'dexie'
import { c } from '@wonderlandlabs/collect'
import validateData from '~/lib/store/validateData'
import { AsyncResponse, Engine, FieldDef, FieldQuery } from '~/lib/store/types'

const indexedEngine = (version = 1, config = {}): Engine => {
  const db = new Dexie('Planboard', config);
  const tables = {}; // the string definition of fields
  const schemas = {};
  let init = false;

  function validate(collection: string, value: any, id: any) {
    if (!(collection in schemas)) {
      console.warn('missing schema --- ', collection, schemas)
      throw new Error('no schema record for ' + collection)
    }
    let schema: FieldDef[] = schemas[collection];
    if (!schema) {
      return;
    }
    validateData(value, schema, collection);
  }

  return {
    initialize() {
      if (init) {
        return;
      }
      db.version(version).stores(tables);
      init = true;
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
        console.warn('query error:', err);
        return { error: err }
      }

    },
    async deleteIds(collection: string, ids: any[]) {
      await db[collection].bulkDelete(ids);
    },
    addStore(collection: string, schema: FieldDef[] | undefined): void {
      if (!collection) {
        throw new Error('bad/empty store collection');
      }
      if (!Array.isArray(schema)) {
        throw new Error('bad schema definition for ' + collection);
      }
      const coll = c(schema);
      tables[collection] = coll.getReduce((schema: string[], fieldDef: FieldDef) => {
        schema.push(fieldDef.indexed ? '&' + fieldDef.name : fieldDef.name);
        return schema;
      }, []).join(',');
      schemas[collection] = schema;
    },
    async fetch(collection: string, id: any): Promise<AsyncResponse> {
      if (!(collection in tables)) {
        return { error: new Error(`no ${collection} collection`) }
      }
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
      if (!(collection in tables)) {
        return { error: new Error(`no ${collection} collection`) }
      }
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
}
export default indexedEngine;

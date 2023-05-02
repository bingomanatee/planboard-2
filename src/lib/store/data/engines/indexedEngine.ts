import Dexie from 'dexie'
import { c } from '@wonderlandlabs/collect'
import validateData from '~/lib/store/validateData'
import { AsyncResponse, Engine, FieldDef, FieldQuery } from '~/lib/store/types'

const indexedEngine = (version = 1, config = {}): Engine => {
  const db = new Dexie('Planboard', config);
  const tables = {}; // the string definition of fields
  const schemas = {};
  let init = false;

  function initialize() {
    if (init) {
      return;
    }
    db.version(version).stores(tables);
    init = true;
  }

  function validate(collection: string, value: any, id: any) {
    if (!(collection in schemas)) {
      console.log('missing schema --- ', collection, schemas)
      throw new Error('no schema record for ' + collection)
    }
    let schema: FieldDef[] = schemas[collection];
    if (!schema) {
      return;
    }
    validateData(value, schema, collection);
  }

  return {
    async query(collection: string, conditions: FieldQuery[]): Promise<AsyncResponse> {
      initialize();
      if (!(collection in db)) {
        return { error: new Error(`no table "${collection}"`) };
      }

      if (!conditions?.length) {
        return { data: db[collection].toArray() }
      }

      const query = conditions.reduce((q, fQuery) => {
        q[fQuery.field] = fQuery.value;
        return q;
      }, {})

      console.log(collection, 'querying ', query, 'from conditions', conditions);
      const data = db[collection].where(query).toArray();
      return { data };
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
        schema.push(fieldDef.name);
        return schema;
      }, []).join(',');
      schemas[collection] = schema
    },
    async fetch(collection: string, id: any): Promise<AsyncResponse> {
      initialize();
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
      initialize();
      if (!(collection in tables)) {
        return { error: new Error(`no ${collection} collection`) }
      }
      validate(collection, value, id);
      try {
        await db[collection].put(value, id);
        return { data: value }
      } catch (error) {
        console.log('error putting: ', value, id, error);
        return { error };
      }
    }
  }
}
export default indexedEngine;
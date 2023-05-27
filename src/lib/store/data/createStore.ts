import { FieldDef, FieldQuery, Filter, StoreMap, StoreRecord } from '~/lib/store/types'
import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
import { c } from '@wonderlandlabs/collect'
import validateData from '~/lib/store/validateData'
import { v4 } from 'uuid'
import { isEqual } from 'lodash'

type ValueMutator = (records: Map<string, any>) => (StoreMap | void);

export function createStore(dataStore: leafI, collectionName, schema?: FieldDef[], config?: Partial<leafConfig>) {
  const actions = config?.actions || {};
  const selectors = config?.selectors || {};
  const engine = dataStore.getMeta('engine');

  engine.addStore(collectionName, schema || []);
  dataStore.addChild({
    id: collectionName,
    $value: new Map(),
    meta: { schema: schema || [] },
    selectors: {
      ...selectors,
      size(leaf: leafI) {
        return leaf.value.size;
      },
      primaryField(leaf: leafI) {
        const primary = leaf.getMeta('primaryField')
        if (primary !== undefined) {
          return primary;
        }
        const schema = leaf.getMeta('schema');
        if (schema) {
          const pk = c(schema).getReduce((primary, def) => {
            if (primary) {
              return primary;
            }
            if (def?.primary) {
              return def.name;
            }
          }, false);
          leaf.setMeta('primaryField', pk);
          return pk;
        } else {
          leaf.setMeta('primaryField', false);
        }
      },
      primaryFromValue(leaf: leafI, value: any) {
        const field = leaf.$.primaryField();
        if (!field) {
          return undefined;
        }
        return c(value).get(field);
      },
      watchId(leaf: leafI, id: string, onChange, skipCurrent = false) {
        let lastRecord = leaf.value.get(id);
        if (!skipCurrent) {
          onChange(lastRecord);
        }
        return leaf.select((record) => {
          if (!isEqual(lastRecord?.content, record?.content)) {
            onChange(record);
          }
          lastRecord = record;
        }, (value: Map<string, StoreRecord>) => value.get(id));
      }
    },
    actions: {
      ...actions,
      async fetch(leaf: leafI, id: string): StoreRecord {
        if (!id) {
          throw new Error('loading ' + collectionName + 'requires id');
        }
        const { data, error } = await engine.fetch(collectionName, id);
        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error(`cannot get ${id}`)
        }
        leaf.do.add(data, id);
        return leaf.value.get(id);
      },
      mutateValue(leaf: leafI, mutator: ValueMutator) {
        const newValue: Map<string, any> = new Map(leaf.value);
        let result = mutator(newValue);
        leaf.value = (result instanceof Map) ? result : newValue;
      },
      add(leaf: leafI, content: any, id?: string): StoreRecord {
        let saved = true;
        validateData(content, leaf.getMeta('schema'), collectionName);

        if (!id) {
          id = leaf.$.primaryFromValue(content);
        }
        if (!id) {
          id = v4();
          saved = false;
        }
        const record = {
          id,
          content,
          saved,
        };
        leaf.do.mutateValue((map) => map.set(id, record));
        return record;
      },
      addMany(leaf: leafI, data: any[], exclusive = false) {
        let saved = true;
        data.forEach(content => validateData(content, leaf.getMeta('schema'), collectionName));
        const ids = [];
        leaf.do.mutateValue((map) => {
          if (exclusive) {
            map.clear();
          }
          data.forEach((content) => {
            let id = leaf.$.primaryFromValue(content);
            if (!id) {
              id = v4();
              saved = false;
            }
            ids.push(id);
            const record = {
              id,
              content,
              saved,
            };
            map.set(id, record);
          });
          return map;
        });
        return ids;
      },
      find(leaf: leafI, filter: Filter, single: true) {
        if (typeof filter === 'function') {
          return c(leaf.value).getReduce((data: any[], record) => {
            if (filter(record)) {
              if (single) {
                throw { $STOP: true, value: record }
              }
              data.push(record);
            }
            return data;
          }, []);
        } else {
          const fieldSpec: FieldQuery[] = filter;
          return c(leaf.value).getReduce((data: any[], record: StoreRecord) => {
            const coll = c(record.content);
            for (const q of fieldSpec) {
              const { value, field } = q;
              if (coll.get(field) !== value) {
                return data;
              }
            }

            if (single) {
              throw { $STOP: true, value: record }
            }
            data.push(record);
            return data;
          }, []);
        }
      },
      async save(store: leafI, id: string) {
        const engine = dataStore.getMeta('engine');
        if (store.value.has(id)) {
          const { content, saved } = store.value.get(id);
          const coll = c(content);
          const pk = store.$.primaryField();
          if (!coll.hasKey(pk)) {
            coll.set(pk, id);
          }
          const { data, error } = await engine.save(collectionName, coll.value, id, saved);
          if (error) {
            throw error;
          }
          return store.do.add(data, id);
        } else {
          throw new Error(`no record found for ${id}`);
        }
      },
      async deleteId(store: leafI, id: string) {
        const engine = dataStore.getMeta('engine');
        // delete remotely
        await engine.deleteId(collectionName, id);
        // delete Locally
        if (store.value.has(id)) {
          store.do.mutateValue((value) => {
            value.delete(id);
          });
        }
      },
      async deleteIds(store: leafI, tableName: string, ids: string[]) {
        const table = store.child(tableName);
        if (table && ids.length) {
          // first delete local values
          table.do.mutateValue((map: StoreMap) => {
            return c(map).filter((_data, id) => (!(ids.includes(id)))).value;
          });
          // then delete stored ids
          await engine.deleteIds(tableName, ids);
        }
      }
    }
  }, collectionName)
}

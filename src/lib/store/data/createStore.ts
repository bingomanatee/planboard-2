import { FieldDef, StoreRecord } from '~/lib/store/types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { c } from '@wonderlandlabs/collect'
import validateData from '~/lib/store/validateData'
import { v4 } from 'uuid'

export function createStore(leaf, engine, collectionName, schema?: FieldDef[], actions = {}, selectors = {}) {
  engine.addStore(collectionName, schema || []);
  leaf.addChild({
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
      mutateValue(leaf: leafI, mutator: (records: Map<string, any>) => void) {
        const newValue: Map<string, any> = new Map(leaf.value);
        mutator(newValue);
        leaf.value = newValue;
      },
      add(leaf: leafI, content: any, id?: string) {
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
        return id;
      },
      addMany(leaf: leafI, data: any[], exclusive = false) {
        let saved = true;
        data.forEach(content => validateData(content, leaf.getMeta('schema'), collectionName)) ;
        const ids = [];
        leaf.do.mutateValue((map) => {
          if (exclusive) map = new Map();
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
            map.set(id, record)
          })
        });
        return ids;
      },
      async save(leaf: leafI, id: string) {
        if (leaf.value.has(id)) {
          const { content, saved } = leaf.value.get(id);
          const coll = c(content);
          const pk = leaf.$.primaryField();
          if (!coll.hasKey(pk)) {
            coll.set(pk, id);
          }
          const { data, error } = await engine.save(collectionName, coll.value, id, saved);
          if (error) {
            throw error;
          }
          leaf.do.add(data, id);
        } else {
          throw new Error(`no record found for ${id}`);
        }
      }
    }
  }, collectionName)
}

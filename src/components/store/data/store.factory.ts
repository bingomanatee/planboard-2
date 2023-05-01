import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { v4 } from 'uuid'
import { c } from '@wonderlandlabs/collect'
import { Engine, FieldDef, StoreRecord } from '~/components/store/types';
import validateData from '~/components/store/validateData'

const storeFactory = (engine: Engine) => {
  const store = new Forest({
    $value: new Map(),
    actions: {
      createStore(leaf: leafI, collectionName: string, schema?: FieldDef[]) {
        engine.addStore(collectionName, schema || []);
        leaf.addChild({
          $value: new Map(),
          meta: { schema: schema || [] },
          selectors: {
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
    }
  });
  store.do.createStore('projects', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'user_id', type: 'string', optional: true }
  ]);
  store.do.createStore('frames', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string', optional: true },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'project_id', type: 'string', optional: true },
    { name: 'top', type: 'number' },
    { name: 'left', type: 'number' },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
    { name: 'content_id', type: 'string', optional: true }
  ]);
  return store;
}
export default storeFactory

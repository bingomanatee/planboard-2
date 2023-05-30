import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { c } from '@wonderlandlabs/collect'
import { Engine } from '~/lib/store/types'
import { dataOrThrow } from '~/lib/utils'

type ValueType = 'string' | 'number' | 'void';
const VOID = Symbol('void');

const contentFactory = (dataStore: leafI, engine: Engine) => {
  const NAME = 'settings';
  createStore(dataStore, NAME, [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' },
    { name: 'value_s', type: 'string', optional: true },
    { name: 'value_n', type: 'number', optional: true },
    { name: 'type', type: 'string' },
    { name: 'project_id', type: 'string' }
  ], {
    selectors: {
      props(store: leafI) {
        return c(store.value)
          .getReduce((
            props, { content }
          ) => {
            const { name, value_s, value_n, type } = content;
            if (type === 'string') {
              props.set(name, value_s);
            } else {
              props.set(name, value_n);
            }
            return props;
          }, new Map());
      },
      targetFieldName(store: leafI, value: any, type?: ValueType) {
        let targetFieldName;

        if (type) { // derive the target field from an explicit injunction -- ignores value
          switch (type) {
            case 'string':
              targetFieldName = 'value_s';
              break;
            case 'number':
              targetFieldName = 'value_n';
              break;
            default:
              throw new Error('targetFieldName cannot accept type ' + type);
          }
        } else { // in the absence of an asserted type, infer from the value.
          if (value === null || (typeof value === 'undefined')) {
            return VOID;
          }
          return store.$.targetFieldName(value, typeof value);
        }
        return targetFieldName;
      },
    },
    actions: {
      /**
       * either selectively loads a single config for a project and returns its value
       * or returns a map of name/value pairs of every config for the project.
       */
      async forProject(store: leafI, projectId: string, config?: string) {
        if (config) {
          const [configItem] = await dataOrThrow(
            engine.query(NAME, [
              { field: 'project_id', value: projectId },
              { field: 'name', value: config }
            ])
          );
          if (configItem) {
            store.do.add(configItem, configItem.id);
          }
          return store.$.props().get(config);
        } else { // get all configs
          const allConfigs = await dataOrThrow(
            engine.query(NAME, [
              { field: 'project_id', value: projectId },
            ])
          );
          store.do.addMany(allConfigs, true);
          return store.$.props();
        }
      },

      /**
       * Updates / creates a configuration setting
       * and saves it to the database.
       * Returns the new config's record.
       */
      addSetting: async function (store: leafI, projectId: string, name: string, value: string | number, type?: ValueType) {
        if (!(projectId && value && name)) {
          throw new Error('addSetting missing required fields');
        }

        const targetFieldName = store.$.targetFieldName(value, type);

        let newType: string;
        if (targetFieldName === VOID) {
          newType = 'void'
        } else {
          newType = (targetFieldName === 'value_n') ? 'number' : 'string'
        }

        const sharedFields = {
          project_id: projectId,
          name,
          type: newType
        }

        const [existingRecord] = store.$.find([
          { field: 'project_id', value: projectId },
          { field: 'name', value: name },
        ]);
        let record;
        let data = sharedFields;
        if (targetFieldName !== VOID) {
          data = {
            ...sharedFields,
            [targetFieldName]: value
          }
          console.log('addSetting - data = ', data, 'tfn:', targetFieldName, 'to settings ', store.id);
        }
        if (existingRecord) {
          record = store.do.add(data, existingRecord.id);
        } else {
          record = store.do.add(data);
        }
        console.log('added record', record, 'to store', store.value);
        return await store.do.save(record.id);
      },
      async loadForProject(store: leafI, id: string) {
        const data = await dataOrThrow(engine.query(NAME, [
          { field: 'project_id', value: id }
        ]));
        store.do.addMany(data, true);
        return store.$.props();
      },
    },
  });
}

export default contentFactory;

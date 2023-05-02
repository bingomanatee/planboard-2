import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine, FieldDef } from '~/lib/store/types';
import { createStore } from '~/lib/store/data/createStore'

const dataStoreFactory = (engine: Engine) => {
  const store = new Forest({
    $value: new Map(),
    actions: {
      createStore(leaf: leafI, collectionName: string, schema?: FieldDef[], actions = {}, selectors = {}) {
        createStore(leaf, engine, collectionName, schema, actions, selectors);
      },
      async loadProjectsFor(leaf: leafI, userId: string) {
        const { data, error } = await engine.query('projects', [{ field: 'user_id', value: userId }]);
        if (error) {
          throw error;
        }
        if (data.projects) {
          leaf.child('projects')!.do.addMany(data.projects, true);
        }
      }
    }
  });
  store.do.createStore('projects', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'user_id', type: 'string', optional: true },
  ], {}, {
    getCurrentProjectId(_leaf: leafI, user_id: string = '') {
      if (typeof localStorage !== 'undefined') {
        const projectId = localStorage.getItem('currentProject_for_' + user_id);
        return projectId || null
      } else {
        return null;
      }
    },
    setCurrentProjectId(_leaf: leafI, user_id: string = '', projectId) {
      if (typeof localStorage !== 'undefined') {
        if (typeof projectId !== 'string') {
          projectId = '';
        }
        localStorage.setItem('currentProjectFor_' + user_id, projectId || '');
      }
    }
  });
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
export default dataStoreFactory

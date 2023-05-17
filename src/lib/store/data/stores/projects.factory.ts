import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine } from '~/lib/store/types'
import { dataOrThrow } from '~/lib/utils'


const projectsFactory = (dataStore: leafI, engine: Engine) => {
  createStore(dataStore, 'projects', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'user_id', type: 'string', optional: true },
  ], {
    actions: {
      async loadProjects(leaf: leafI) {
        const userId = leaf.parent!.$.userId();
        const { data, error } = await engine.query('projects', [{ field: 'user_id', value: userId }]);
        if (userId !== leaf.parent!.$.userId()) {
          console.warn('--- user id changed -- not loading')
          return;
        }
        if (error) {
          throw error;
        }
        if (data) {
          leaf.do.addMany(data, true);
        }
      },
      async loadProjectRecord(store: leafI, id: string) {
       const data = await dataOrThrow( engine.query('projects', [
          { field: 'id', value: id },
          { field: 'user_id', value: dataStore.$.userId() }
        ]));
        const [project] = data;
        if (!project) {
          throw new Error('cannot find project ' + id + ' for user ' + dataStore.$.userId())
        }
        store.do.add(project);
        return project;
      },
    }, selectors: {
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
    }
  });
 }

 export default projectsFactory;

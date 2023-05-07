import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'


const projectsFactory = (store) => {
  createStore(store, 'projects', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'user_id', type: 'string', optional: true },
  ], {
    actions: {
      async loadProjects(leaf: leafI) {
        const userId = leaf.parent!.$.userId();
        const engine = leaf.parent!.getMeta('engine');
        console.log('loading projects for user id ', userId);
        const { data, error } = await engine.query('projects', [{ field: 'user_id', value: userId }]);
        if (userId !== leaf.parent!.$.userId()) {
          console.log('--- user id changed -- not loading')
          return;
        }
        console.log('data for user id ', userId, data);
        if (error) {
          throw error;
        }
        if (data) {
          leaf.do.addMany(data, true);
        }
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
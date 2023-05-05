import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine, FieldDef, StoreRecord } from '~/lib/store/types';
import { createStore } from '~/lib/store/data/createStore'
import { Vector2 } from 'three'
import { Frame } from '~/types'
import { c } from '@wonderlandlabs/collect'

const dataStoreFactory = (engine: Engine) => {
  const store = new Forest({
    $value: new Map([['user', null]]),
    selectors: {
      userId(leaf: leafI) {
        const user = leaf.value.get('user');
        return user?.id || '';
      }
    },
    actions: {
      async loadProject(leaf: leafI, id: string) {
        const { data, error } = await engine.query('projects', [
          { field: 'id', value: id },
          { field: 'user_id', value: leaf.$.userId() }
        ]);
        if (error) {
          throw error;
        }
        try {
          const [project] = data;
          if (!project) {
            throw new Error('cannot find project ' + id + ' for user ' + leaf.$.userId())
          }
          leaf.child('projects')!.do.add(project);

          const result = await engine.query('frames', [
            { field: 'project_id', value: id }
          ]);
          console.log('frames query result:', result);
          const { data: datF, error: errorF } = result;

          if (errorF) {
            console.log('frame load error', errorF)
            throw errorF;
          }
          leaf.child('frames')!.do.addMany(datF);
          return { project, frames: datF };
        } catch (err) {
          console.log('data load error:', err)
          return { error: err }
        }
      },
      createStore(leaf: leafI, collectionName: string, schema?: FieldDef[], actions = {}, selectors = {}) {
        createStore(leaf, engine, collectionName, schema, actions, selectors);
      },
    }
  });
  store.do.createStore('projects', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'user_id', type: 'string', optional: true },
  ], {
    actions: {
      async loadProjects(leaf: leafI) {
        const userId = leaf.parent!.$.userId();
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
  ], {
    actions: {
      createFrame(state: leafI, project_id, start: Vector2, end: Vector2) {
        console.log('creating frame', project_id, start.clone(), end);
        if (project_id && start && end) {
          const order = c(state.value).getReduce((ord, store: StoreRecord<string, Frame>) => {
            if (store.content.order > ord) {
              return store.content.order;
            }
            return ord;
          }, 0) + 1;

          const newFrame = {
            project_id,
            left: start.x,
            top: start.y,
            width: end.x - start.x,
            height: end.y - start.y,
            order
          };

          const record = state.do.add(newFrame);
          state.do.save(record.id);
          console.log('record is', record);
        } else {
          console.log('missing data:', project_id, start, end);
        }
      }

    }
  });
  return store;
}
export default dataStoreFactory

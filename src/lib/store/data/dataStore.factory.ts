import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine, FieldDef, StoreRecord } from '~/lib/store/types';
import { createStore } from '~/lib/store/data/createStore'
import { Vector2 } from 'three'
import { Frame } from '~/types'
import { c } from '@wonderlandlabs/collect'
import projectsFactory from '~/lib/store/data/stores/projects.factory'
import framesFactory from '~/lib/store/data/stores/frames.factory'
import contentFactory from '~/lib/store/data/stores/content.factory'

const dataStoreFactory = (engine: Engine) => {
  const store = new Forest({
    $value: new Map([['user', null]]),
    meta: {
      engine
    },
    selectors: {
      userId(leaf: leafI) {
        const user = leaf.value.get('user');
        return user?.id || '';
      }
    },
    actions: {
      async setFrameContentType(leaf: leafI, frameId, type) {
        const frame = leaf.child('frames')!.value.get(frameId);
        if (!frame) {
          console.log('setContentFrameType -- no frame for ', frameId);
        }

        const contentStore = leaf.child('content')!;
        await contentStore.do.deleteContentForFrame(frameId);

        const content = {
          frame_id: frameId,
          type,
          project_id: frame.content.project_id
        };
        console.log('creating content ', content);
        try {
          const record = contentStore.do.add(content);
          await contentStore.do.save(record.id);
        } catch (err) {
          console.warn('error saving content:', content, err);
          throw err;
        }
      },
      async loadProject(leaf: leafI, id: string) {
        console.log('---------- loading project ', id);
        const engine = leaf.getMeta('engine');
        const { data, error } = await engine.query('projects', [
          { field: 'id', value: id },
          { field: 'user_id', value: leaf.$.userId() }
        ]);
        if (error) {
          throw error;
        }

        const [project] = data;
        if (!project) {
          throw new Error('cannot find project ' + id + ' for user ' + leaf.$.userId())
        }
        leaf.child('projects')!.do.add(project);

        const { data: dataFrames, error: errorF } = await engine.query('frames', [
          { field: 'project_id', value: id }
        ]);

        if (errorF) {
          console.log('frame load error', errorF)
          throw errorF;
        }
        leaf.child('frames')!.do.addMany(dataFrames, true);

        const { data: dataContent, error: errorC } = await engine.query('content', [
          { field: 'project_id', value: id }
        ]);
        if (errorC) {
          throw errorC;
        }
        console.log('========= content data:', dataContent);
        leaf.child('content')!.do.addMany(dataContent, true);
        return { project, frames: dataFrames, content: dataContent };
      },
    }
  });
  projectsFactory(store);
  framesFactory(store);
  contentFactory(store);
  engine.initialize();
  return store;
}
export default dataStoreFactory;

import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine, FieldDef, StoreRecord } from '~/lib/store/types';
import { createStore } from '~/lib/store/data/createStore'
import { Vector2 } from 'three'
import { Content, Frame } from '~/types'
import { c } from '@wonderlandlabs/collect'
import projectsFactory from '~/lib/store/data/stores/projects.factory'
import framesFactory from '~/lib/store/data/stores/frames.factory'
import contentFactory from '~/lib/store/data/stores/content.factory'
import markdownFactory from '~/lib/store/data/stores/markdown.factory'

export type FrameInfo = {
  frame: Frame,
  content: Content,
  contentData: any | null
}

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
      async frameInfo(leaf: leafI, frameId: string): FrameInfo {
        // assumes that information has already been loaded locally;
        const frameRecord = leaf.child('frames')!.value.get(frameId);
        const contentRecord = leaf.child('content')!.do.forFrame(frameId);
        let contentData = null;
        if (contentRecord?.content) {
          switch (contentRecord.content.type) {
            case 'markdown':
               const mkRecord = await leaf.child('markdown')!.do.forContent(contentRecord.id);
               if(mkRecord) {
                 contentData = mkRecord.content;
               }
              break;
          }
        } else {
          console.warn('--- cannot get contentRecord for frame', frameId);
        }
        return {
          frame: frameRecord.content,
          content: contentRecord?.content,
          contentData
        };
      },
      async setFrameContentType(leaf: leafI, frameId, type) {
        const frame = leaf.child('frames')!.value.get(frameId);
        if (!frame) {
          console.warn('setContentFrameType -- no frame for ', frameId);
          return;
        }

        const contentStore = leaf.child('content')!;
        await contentStore.do.deleteContentForFrame(frameId);

        const content = {
          frame_id: frameId,
          type,
          project_id: frame.content.project_id
        };

        try {
          const record = contentStore.do.add(content);
          await contentStore.do.save(record.id);
        } catch (err) {
          console.warn('error saving content:', content, err);
          throw err;
        }
      },
      async loadProject(leaf: leafI, id: string) {
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
          console.warn('frame load error', errorF)
          throw errorF;
        }
        leaf.child('frames')!.do.addMany(dataFrames, true);

        const { data: dataContent, error: errorC } = await engine.query('content', [
          { field: 'project_id', value: id }
        ]);
        if (errorC) {
          throw errorC;
        }
        leaf.child('content')!.do.addMany(dataContent, true);
        return { project, frames: dataFrames, content: dataContent };
      },
      async updateFrame(leaf: leafI, frame: Frame, content: Content, contentData: any) {
        const frameStore = leaf.child('frames')!;
        const frameRecord = await frameStore.do.updateFrame(frame);
        switch (content.type) {
          case 'markdown':
            const markdownStore = leaf.child('markdown')!;
            const markdownRecord = await markdownStore.do.updateMarkdown(contentData, content);
            return { frameRecord, markdownRecord }
            break;

          default:
            console.warn('cannot find content updater for type ', content.type);
            return { frameRecord }
        }
      }
    }
  });
  projectsFactory(store);
  framesFactory(store);
  contentFactory(store);
  markdownFactory(store);
  engine.initialize();
  return store;
}
export default dataStoreFactory;

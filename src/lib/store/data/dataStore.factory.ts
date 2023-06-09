import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine } from '~/lib/store/types';
import { Content, Frame } from '~/types'
import projectsFactory from './stores/projects.factory'
import framesFactory from './stores/frames.factory'
import contentFactory from './stores/content.factory'
import markdownFactory from './stores/markdown.factory'
import imagesFactory from './stores/images.factory'
import settingsFactory from './stores/settings.factory'
import linksFactory from './stores/links.factory'

export type FrameInfo = {
  frame: Frame,
  content: Content,
  contentData: any | null
}

const dataStoreFactory = (engine: Engine) => {
  const dataStore = new Forest({
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

            case 'image':
              const imgRecord = await leaf.child('images')!.do.forContent(contentRecord.id);
              if (imgRecord) {
                contentData = imgRecord.content;
              }
              break
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
        const [project, frames, content] = await Promise.all([
          leaf.child('projects')!.do.loadProjectRecord(id),
          leaf.child('frames')!.do.loadForProject(id),
          leaf.child('content')!.do.loadForProject(id),
          leaf.child('settings')!.do.loadForProject(id),
          leaf.child('links')!.do.loadForProject(id),
        ])

        return { project, frames, content };
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
      },
      async setFrameSize(leaf: leafI, frameId: string, width: number, height : number) {
        if (width > 10 && height > 10) {
          const frameStore = leaf.child('frames')!;
          const frameRecord = frameStore.value.get(frameId);
          if (!frameRecord) {
            console.warn('cannot find frame', frameId);
            return;
          }
          const newContent = {...frameRecord.content, width, height};
          frameStore.do.add(newContent, frameId);
          return frameStore.do.save(frameId);
        } else {
          console.warn('width and height are too small -- not using on ', frameId);
        }
      },
      async deleteFrame(leaf: leafI, frameId: string) {
        await leaf.child('content')!.do.deleteContentForFrame(frameId);
        await leaf.child('frames')!.do.deleteId(frameId);
        await leaf.child('links')!.do.deleteForFrame(frameId);
      }
    }
  });
  projectsFactory(dataStore, engine);
  framesFactory(dataStore, engine);
  contentFactory(dataStore, engine);
  markdownFactory(dataStore, engine);
  imagesFactory(dataStore, engine);
  settingsFactory(dataStore, engine);
  linksFactory(dataStore, engine);
  engine.initialize();
  return dataStore;
}
export default dataStoreFactory;

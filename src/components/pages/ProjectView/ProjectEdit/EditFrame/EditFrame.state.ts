import { leafI } from '@wonderlandlabs/forest/lib/types'
import imageDataState from './ImageEditor/imageData.state';

const EditFrameState = (dataState, closeTrigger) => {
    return {
      $value: {},
      selectors: {},
      actions: {
        async load(state: leafI, id: string) {
          const result = await dataState.do.frameInfo(id);
          const { frame, content, contentData } = result;
          if (frame) {
            state.child('frame')!.value = frame;
          }
          if (content) {
            state.child('content')!.value = content;
          }
          /*
            console.log('EditFrameState: result = ', result);
            console.log('EditFrameState: frame = ', frame);
            console.log('EditFrameState: content = ', content);
            console.log('EditFrameState: contentData = ', contentData);
            */

          let $value;
          switch (content.type) {
            case 'markdown':
              $value = { title: '', text: '', ...(contentData || {}) };
              state.addChild({ name: 'contentData', $value }, 'contentData');
              break;

            case 'image':
              state.addChild(imageDataState(dataState, contentData, content), 'contentData');
              state.child('contentData')!.do.load();
              break;


            default:
              console.warn('cannot create contentData for type ', content.type)
          }
        },
        cancel(state: leafI) {
          closeTrigger();
        },
        async commit(state: leafI) {
          const { frame, content, contentData } = state.value;
          const { markdownRecord, frameRecord } = await dataState.do.updateFrame(frame, content, contentData);
          const contentDataState = state.child('contentData')!;
          if (contentDataState.do.commit) {
            console.log('committing contentData state')
            await contentDataState.do.commit();
          } else {
            console.warn('no contentData commit', contentDataState);
          }
          closeTrigger();
        },
        delete(state: leafI) {
          if (state.child('frame')?.value.id) {
            dataState.do.deleteFrame(state.child('frame')?.value.id);
            closeTrigger();
          }
        }
      },
      children: {
        frame: {
          $value: { id: null, project_id: null, order: 0, name: '' }
        },
        content: {
          $value: { frame_id: null, project_id: null, type: '', id: '' }
        }
      }
    };
  }
;

export default EditFrameState;

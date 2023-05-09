import { leafI } from '@wonderlandlabs/forest/lib/types'
import { RefObject } from 'react'

const EditFrameState = (dataState, onCancel) => {
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
              $value = { width: 0, height: 0, fileName: '', ...(contentData || {}) };
              state.addChild({
                name: 'contentData', $value,
                actions: {
                  onFileChange(state: leafI,
                               e: MouseEvent, { files }: { files: File[] }) {
                    const file = files[0];
                    console.log('onFileChange file:', file);
                    if (!file) {
                      return;
                    }
                    const displayImage: RefObject<HTMLImageElement> = state.getMeta('displayImage');
                    const reader = new FileReader();
                    //   leaf.do.set_name(file.name);
                    //  leaf.do.set_fileName(file.name);
                    console.log('existing content data:', state.value);

                    reader.onload = function () {
                      if (displayImage.current && reader.result) {
                        // @ts-ignore
                        displayImage.current.src = reader.result;
                        setTimeout(() => {
                          const box = displayImage.current!.getBoundingClientRect();
                          const { width, height } = box;
                          state.value = { ...state.value, width, height }; // @TODO: also set frame size
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                    state.setMeta('fileObj', file, true);
                    state.setMeta('fileReader', reader, true);
                  },
                }
              }, 'contentData');
              break;

            default:
              console.warn('cannot create contentData for type ', content.type)
          }
        },
        cancel(state: leafI) {
          onCancel();
        },
        async commit(state: leafI) {
          const { frame, content, contentData } = state.value;
          const { markdownRecord, frameRecord } = await dataState.do.updateFrame(frame, content, contentData);
          onCancel();
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

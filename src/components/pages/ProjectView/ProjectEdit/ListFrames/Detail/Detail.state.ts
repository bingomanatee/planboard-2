import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { FrameInfo } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/types'
import { delay } from 'rxjs'
import { debounce, isEqual } from 'lodash'
import { Frame } from '~/types'

export type DetailStateValue = FrameInfo & {
  selected: string,
  loaded: boolean | null;
  hasContent: boolean,
  hasContentData: boolean,
  contentData: any | null,
  savingFrame: Frame | null;
};

const DetailState = (dataState, projectId) => {
  const $value: DetailStateValue = {
    selected: '',
    loaded: false,
    hasContent: false,
    hasContentData: false,
    contentData: null
  };
  return {
    $value,

    selectors: {},
    children: {
      content: {
        $value: {
          frame_id: '',
          project_id: '',
          type: '',
          id: ''
        },
      },
      frame: {
        $value: {
          name: '',
          id: '',
          project_id: '',
          order: 0,
          top: 0,
          left: 0,
          width: 0,
          height: 0
        },
        fixedSetters: ['name', 'top', 'left', 'width', 'height', 'id', 'order']
      }
    },
    actions: {
      load(state: typedLeaf<DetailStateValue>, selected) {
        const { loaded } = state.value;
        if (selected && loaded && state.value.selected === selected) {
          return;
        }
        state.do.set_selected(selected);
        if (selected) {
          state.do.set_loaded(false);
          return state.do.loadFrame()
        } else {
          state.do.set_loaded(null);
        }
      },
      async loadFrame(state: leafI) {
        const { selected } = state.value;
        if (selected) {
          state.do.set_selected(selected);
          const { frame, content, contentData } = await dataState.do.frameInfo(selected);
          state.child('frame')!.value = frame;
          state.do.set_loaded(true);

          if (content) {
            state.child('content')!.value = content;
            state.do.set_hasContent(true);
          } else {
            // note - content may end up with "leftover values" --
            // we aren't clearing the content state because, lazy
            state.do.set_hasContent(false);
          }
          if (contentData) {
            state.do.set_contentData(contentData);
            state.do.set_hasContentData(true);
          } else {
            // we ARE on the other hand clearing out (mostly) the contentData
            // because it is not a child-encased state.
            state.do.set_contentData({});
            state.do.set_hasContentData(false);
          }
        }
      },

      watch(state: leafI) {
        // when the local state changes,
        // save the updates after 1200 seconds of no further changes.
        // note - the subscribing function,
        const sub = state.child('frame')!.subscribe((value) => {
          try {
            return state.do.update(value)
          } catch (err) {
            console.log('watcher error:', err);
          }
        });
        return sub;
      },
      async update(state: typedLeaf<DetailStateValue>, frame) {
        try {
          const { loaded } = state.value;
          console.log('updating ', frame, loaded);
          if (frame && loaded) {
            const frameStore = dataState.child('frames')!;
            frameStore.do.add({ ...frame }, frame.id);
            await frameStore.do.save(frame.id);
          }
        } catch (err) {
          console.log('update error -- ', err);
        }

      },
    },
  };
};

export default DetailState;

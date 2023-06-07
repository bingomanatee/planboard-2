import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { FrameInfo } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/types'
import { Frame, Link } from '~/types'
import { linkVector } from '~/lib/store/data/stores/links.factory'
import reactToString from '~/components/utils/reactToString'

export type DetailStateValue = FrameInfo & {
  selected: string,
  loaded: boolean | null;
  hasContent: boolean,
  hasContentData: boolean,
  contentData: any | null,
  savingFrame: Frame | null;
  links: Link[] | null;
  currentLink: string | null;
};

const DetailState = (dataState, lfState: leafI) => {

  const $value: DetailStateValue = {
    selected: '',
    loaded: false,
    hasContent: false,
    hasContentData: false,
    contentData: null,
    links: null,
    currentLink: null
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
          height: 0,
        },
        children: {
          style: {
            $value: {
              mode: 'straight line'
            }
          }
        },
        fixedSetters: ['name', 'top', 'left', 'width', 'height', 'id', 'order']
      }
    },
    actions: {
      handleLinkClick(state: typedLeaf<DetailStateValue>, e: MouseEvent, link: Link) {
        e.stopPropagation();
        if (state.value.currentLink === link.id) {
          return state.do.set_currentLink(null);
        }
        state.do.set_currentLink(link.id);
      },
      loadLinks(state: typedLeaf<DetailStateValue>) {
        if (!state.value.selected) return state.do.set_links(null);
        const links = dataState.child('links')!.$.forFrame(state.value.selected);

        state.do.set_links(links.map(({content}) => content));
      },
      load(state: typedLeaf<DetailStateValue>, selected) {
        const { loaded } = state.value;
        if (!selected) {
          state.do.set_links(null);
        }
        if (selected && loaded && state.value.selected === selected) {
          return;
        }
        state.do.set_selected(selected);
        if (selected) {
          state.do.set_loaded(false);
          return state.do.loadFrame(selected);
        } else {
          state.do.set_loaded(null);
        }
      },
      async loadFrame(state: leafI, selected) {
        if (selected) {
          state.do.set_selected(selected);
          const data = await dataState.do.frameInfo(selected);
          const { frame, content, contentData, links} = data;
          const frameStore = state.child('frame')!;
          frameStore.value = frame;
          if (frame.style) {
            if (typeof frame.style === 'string') {
              console.log('---- parsing style', frame.style);
              try {
                frameStore.child('style')!.value = JSON.parse(frame.style);
              } catch (err) {
                console.log('error parsing style:', err);
              }
            }
          }
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
          state.do.loadLinks(selected);
        } else {
          state.do.set_links(null);
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
          if (frame && loaded) {
            const frameStore = dataState.child('frames')!;
            console.log('updating frame based on ', frame);
            frameStore.do.add({ ...frame }, frame.id);
            await frameStore.do.save(frame.id);
          }
        } catch (err) {
          console.log('update error -- ', err);
        }

      },
      onFrameDetailChange(state, id, label) {
        const labelString = reactToString(label);
        if (/Links/.test(labelString)) {
          lfState.do.onFrameDetailChange('Links');
        } else {
          lfState.do.onFrameDetailChange(labelString)
        }
      }
    },
  };
};

export default DetailState;

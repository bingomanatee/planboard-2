import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { debounce } from 'lodash'
import { StoreRecord } from '~/lib/store/types'
import { Frame } from '~/types'

export type DrawLinkStateValue = {
  start: string | null,
  end: string | null,
  startShadow: string | null,
  endShadow: string | null,
  startFrame: StoreRecord<Frame> | null,
  endFrame: StoreRecord<Frame> | null,
};

/**
 * note -- this is a transient system; its assumed that for the
 * lifetime of this state(and its enclosing component) the frame's
 * parameters are not going to change.
 */
const DrawLinkState = (props, dataState, containerRef) => {
    const frames = dataState.value.get('frames')!;
    const $value: DrawLinkStateValue = {
      start: props.linkStartId,
      end: props.linkEndId,
      startShadow: props.linkStartId,
      endShadow: props.linkEndId,
      startFrame: frames.get(props.linkStartId),
      endFrame: null
    };

    return {
      $value,
      selectors: {
        clearRef() {
          while (containerRef.current?.firstChild) {
            containerRef.current.removeChild(containerRef.current.lastChild);
          }
        },
      },

      actions: {
        updateFrame(store, id, stored, setter) {
          if (id) {
            // if the current value is absent or the wrong frame, attach the new one.
            if (stored?.id !== id) {
              setter(frames.get(id));
            }
          } else if (stored) {
            // if there is no ID, remove the stored frame.
            setter(null);
          }
        },
        updateFrames(state: typedLeaf<DrawLinkStateValue>) {
          const { startShadow, endShadow, startFrame, endFrame } = state.value;
          state.do.updateFrame(startShadow, startFrame, state.do.set_startFrame);
          state.do.updateFrame(endShadow, endFrame, state.do.set_endFrame);
        },
        immediateSync(state: typedLeaf<DrawLinkStateValue>) {
          const { start, end, startShadow, endShadow } = state.value;
          // note - if start and/or end are absent it doesn't immediately remove them;
          // that occurs later in fullSync();
          if (start && (startShadow !== start)) {
            state.do.set_startShadow(start);
          }
          if (end && (endShadow !== end)) {
            state.do.set_endShadow(end);
          }
          state.do.updateFrames();
        },
        fullSync(state: typedLeaf<DrawLinkStateValue>) {
          const { start, end, startShadow, endShadow } = state.value;
          if (startShadow !== start) {
            state.do.set_startShadow(start);
          }
          if (endShadow !== end) {
            state.do.set_endShadow(end);
          }
          state.do.updateFrames();
          state.do.updateFrames();
        },
        update(state: typedLeaf<DrawLinkStateValue>, start, end) {
          if (!(start == state.value.start)) {
            state.do.set_start(start);
          }
          if (!(end == state.value.end)) {
            state.do.set_end(end);
          }
          // assert all positive / lateral changed immediately
          state.do.immediateSync();
          if (!state.getMeta('debounced')) {
            state.setMeta('debounced', debounce(state.do.fullSync, 250));
          }
          // in half a second if start or end are falsy, change then.
          state.getMeta('debounced')();
        }
      }
    };
  }
;

export default DrawLinkState;

import { leafI } from '@wonderlandlabs/forest/lib/types'

/**
 * note - 'closed' is a temporary condition to hide the drop for a quick time to
 *        reset it to the frame's current status, such as after a move.
 */
const ContentPromptState = (props, dataState: leafI, projectState) => {
  const { frameState, frameId } = props;
  return {
    $value: { show: false, hover: null, closed: false },
    selectors: {},
    actions: {
      select(state: leafI, type: string, e: MouseEvent) {
        e.stopPropagation();
        dataState.do.setFrameContentType(frameId, type);
        frameState.do.float(null);
        // will hide contentPrompt once a content node for this frame is set
      },
      hover(state: leafI, hover: string | null) {
        state.do.set_hover(hover);
      },
      showOptions(state: leafI, e) {
        e.stopPropagation();
        state.do.set_show(true);
          frameState?.do.float(frameId);
      },
      reopen(leaf: leafI) {
        setTimeout(() => {
          leaf.do.set_closed(false);
        })
      },
      closeOptions(leaf: leafI) {
        leaf.do.set_show(false);
        leaf.do.set_closed(true);
      }
    }
  };
};

export default ContentPromptState;

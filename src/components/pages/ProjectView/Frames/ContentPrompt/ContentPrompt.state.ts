import { leafI } from '@wonderlandlabs/forest/lib/types'

const ContentPromptState = (props, dataState: leafI, projectState) => {
  const { frameState, frameId } = props;
  return {
    $value: { showOptions: false, hover: null, closed: false },
    selectors: {},
    actions: {
      select(state: leafI, type: string, e: MouseEvent) {
        e.stopPropagation();
        dataState.do.setFrameContentType(frameId, type);
        // will hide contentPrompt once a content node for this frame is set
      },
      hover(state: leafI, hover: string | null) {
        state.do.set_hover(hover);
      },
      showOptions(state: leafI, e) {
        e.stopPropagation();
        state.do.set_showOptions(true);
        if (frameState) {
          frameState.do.float(frameId);
          // frameState.setMeta('toggleFloat', state.do.closeOptions, true)
        }

        setTimeout(() => {
          projectState.do.addDownListener(state.do.autoCloseOptions);
        })
      },
      reopen(leaf: leafI) {
        setTimeout(() => {
          leaf.do.set_closed(false);
        })
      },
      autoCloseOptions(leaf: leafI) {
        leaf.do.closeOptions();
      },
      closeOptions(leaf: leafI) {
        leaf.do.set_showOptions(false);
        leaf.do.set_closed(true);
      }
    }
  };
};

export default ContentPromptState;

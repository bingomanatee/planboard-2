import { leafI } from '@wonderlandlabs/forest/lib/types'
import { TargetData } from '~/components/pages/ProjectView/ProjectView.state'

/*
this is the compoent that shows ALL the frames (Frames plural).
 */
const FramesViewState = (props, projectState) => {
  return {
    $value: {floatId: null, editItem: null, hover: null},
    selectors: {},
    actions: {
      hover(state: leafI, hoverId) {
        state.do.set_hover(hoverId);
      },
      unHover(state: leafI) {
        state.do.set_hover(null);
      },
      edit(state: leafI, info: TargetData | null) {
        if (projectState.value.mouseMode) {
          console.warn('ignoring edit click - project mode is ', projectState.value.mouseMode);
          return;
        }
        state.do.set_editItem(info || null);
      },
      move(state: leafI, info: TargetData | null) {
        console.log('initiating move')
        projectState.do.initMove(info);
      },
      closeEdit(state: leafI) {
        state.do.set_editItem(null);
      },
      float(leaf: leafI, id) {
        const toggleFloat = leaf.getMeta('toggleFloat');
        if (typeof toggleFloat === 'function') {
          toggleFloat();
          leaf.setMeta('toggleFloat', null, true);
        }
        leaf.do.set_floatId(id || null);
      }
    }
  };
};

export default FramesViewState;

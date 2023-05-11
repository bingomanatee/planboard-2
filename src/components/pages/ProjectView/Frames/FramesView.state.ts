import { leafI } from '@wonderlandlabs/forest/lib/types'
import { EditItem } from '~/components/pages/ProjectView/ProjectView.state'

/*
this is the compoent that shows ALL the frames (Frames plural).
 */
const FramesViewState = (props) => {
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
      edit(state: leafI, info: EditItem | null) {
        state.do.set_editItem(info || null);
      },
      cancelEdit(state: leafI) {
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

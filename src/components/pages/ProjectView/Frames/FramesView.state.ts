import { leafI } from '@wonderlandlabs/forest/lib/types'

const FramesViewState = (props) => {
  return {
    $value: {floatId: null},
    selectors: {},
    actions: {
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

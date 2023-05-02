import { leafI } from '@wonderlandlabs/forest/lib/types'

const FormEntryState = () => {
  return {
    $value: {},
    selectors: {
      rows: () => (['auto', 'flex']),
      grid(_leaf: leafI) {
        return [
          { name: 'label', start: [0, 0], end: [1, 0] },
          { name: 'input', start: [1, 1], end: [1, 1] }
        ]
      }
    },
    actions: {}
  };
};

export default FormEntryState;

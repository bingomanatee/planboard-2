import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { RgbaColor } from 'react-colorful'
import { dataOrThrow } from '~/lib/utils'
import { EditGridProps } from '~/components/pages/ProjectView/ProjectEdit/EditGrid/types'

export type GridStateValue = {
  active: boolean,
  resolution: number | null,
  resText: number | string,
  gridColor: RgbaColor | null,
  projectId: string,
  loaded: boolean
}

//@TODO: load current state from saved props
const EditGridState = (props: EditGridProps, dataState, projectId) => {
  const $value = {
    active: false,
    resolution: null,
    resText: '',
    projectId,
    gridColor: null,
    loaded: false
  }
  return {
    $value,
    selectors: {},
    actions: {
      async load(store: typedLeaf<GridStateValue>) {
        const props = await dataState.child('settings')!.do.loadForProject(projectId);

        const config = props.get('grid');
        if (config) {
          try {
            const { resolution, active, gridColor } = JSON.parse(config);
            store.do.set_resolution(resolution);
            store.do.set_active(active);
            store.do.set_resText(`${resolution}`)
            store.do.set_gridColor(gridColor);
          } catch (err) {
            console.warn('error parsing grid config:', err);
          }
        }
        store.do.set_loaded(true);
      },
      setRes(store: typedLeaf<GridStateValue>, value) {
        store.do.set_resolution(value ? Math.max(0, Number(value)) : null);
      },
      async commit(store: typedLeaf<GridStateValue>) {
        const { resolution, active, gridColor } = store.value;
        await dataState.child('settings')!.do.addSetting(projectId, 'grid',
          JSON.stringify({ resolution, active, gridColor }, 'string'));
        props.closeTrigger();
      }
    }
  };
};

export default EditGridState;

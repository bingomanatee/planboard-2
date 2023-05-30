import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { RgbaColor } from 'react-colorful'
import { StoreRecord } from '~/lib/store/types'
import { Setting } from '~/types'

export type ProjectGridStateValue = {
  resolution: number;
  active: boolean;
  gridColor: RgbaColor | null
};

const ProjectGridState = (props) => {
  const $value: ProjectGridStateValue = {
    active: false,
    resolution: 0,
    gridColor: null
  };
  return {
    $value,

    selectors: {},

    actions: {
      loadSetting(store: typedLeaf<ProjectGridStateValue>, setting?: Setting) {
        console.log("PGS: got grid setting", setting);
        if (!setting) {
          return store.do.setDefault();
        }
        const settingString = setting.value_s;
        try {
          const {
            active,
            resolution,
            gridColor
          } = JSON.parse(settingString);
          if (active && resolution && gridColor) {
            store.do.set_resolution(resolution);
            store.do.set_active(true);
            store.do.set_gridColor(gridColor);
          } else {
            store.do.setDefault();
          }
        } catch (err) {
          console.warn('cannot parse setting:', err);
          store.do.setDefault();
        }
      },
      setDefault(store: typedLeaf<ProjectGridStateValue>) {
        store.do.set_resolution(0);
        store.do.set_active(false);
        store.do.set_gridColor(null);
      }
    }
  };
};

export default ProjectGridState;

import getImageUrl from '~/components/utils/getImageUrl'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { propsToPx } from '~/lib/utils'
import { Content, ImageData } from '~/types'

export type CropScaleStateValue = {
  scale: number;
  width: number | null;
  height: number | null;
  imageData: ImageData | null;
};

const CropScaleState = (props, displayImage) => {
  const { id, projectId } = props;
  const $value: CropScaleStateValue = { scale: 1, width: null, height: null, imageData: {} };
  return {
    $value,

    selectors: {
      imageStyle(state: typedLeaf<CropScaleStateValue>) {
        if (!state.value.imageData) {
          return {};
        }
        const { width, height, scale } = state.value;
        if (width && height) {
          return propsToPx({ width : width * scale, height: height * scale })
        }
        return {};
      }
    },

    actions: {
      async load() {
        const url = await getImageUrl(id, projectId);

        if (displayImage && url) {
          displayImage.current.src = url;
        }
      }
    }
  };
};

export default CropScaleState;

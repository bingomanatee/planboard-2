import { leafI } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios'

const ImageState = (props, dataStore) => {
  const content = props.content
  const { frame_id: frameId, id: contentId } = (content || {});

  return {
    $value: { frameId, contentId, image: null, id: null, stored: false, imageUrl: '', imageUrlLoadError: null },
    selectors: {},
    actions: {
      async checkImageUrl(store: leafI) {
        const {image, id} = store.value;

        if (id) {
          console.log('checking image url for', id);
          try {
            const {data} = await axios.get(`/api/imageUrl/${id}`);
            if (data.image_url) {
              store.do.set_imageUrl(data.image_url);
              store.do.set_stored(true);
            } else {
              throw new Error('no image_url in data');
            }
          } catch (error) {
            store.do.set_imageUrl('');
            store.do.set_imageUrlLoadError(error);
          }
        } else {
          console.warn('cannot check image url -- missing id');
        }
      },
      async loadContent(store: leafI) {
        let imageRecord = await dataStore.child('images')!
          .do.forContent(content.id);
        store.do.set_image(imageRecord.content);
        store.do.set_id(imageRecord.id);
        await store.do.checkImageUrl();
      }
    }
  };
};

export default ImageState;

import { leafI } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios'

const ImageState = (props, dataStore) => {
  const content = props.content
  console.log('image state for content:', content);
  const { frame_id: frameId, id: contentId } = (content || {});

  return {
    $value: { frameId, contentId, image: null, id: null, stored: false, imageUrl: '', imageUrlLoadError: null },
    selectors: {},
    actions: {
      async checkImageUrl(store: leafI) {
        const {id} = store.value;

        if (id) {
          try {
            const {data} = await axios.get(`/api/imageUrl/${content.project_id}/${id}`);
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
        if (!content?.id) {
          throw new Error('loadContent -- no id in content', content);
        }
        let imageRecord = await dataStore.child('images')!
          .do.forContent(content.id); // upsterts -- there should  be no scenario in which it doesn't exist
        store.do.set_image(imageRecord.content);
        store.do.set_id(imageRecord.id);
        await store.do.checkImageUrl();
      }
    }
  };
};

export default ImageState;

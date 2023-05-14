import { leafI } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios'
import checkImageUrl from '~/components/utils/getImageUrl'

const ImageState = (props, dataStore) => {
  const content = props.content
  const { frame_id: frameId, id: contentId } = (content || {});

  return {
    $value: { frameId, contentId, image: null, id: null, stored: false, imageUrl: '', imageUrlLoadError: null },
    selectors: {},
    actions: {
      async checkImageUrl(store: leafI) {
        const { id } = store.value;

        if (id) {
          try {
            const imageUrl = await checkImageUrl(id, content.project_id);
            store.do.set_imageUrl(imageUrl);
            store.do.set_stored(true);
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

import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Content, ImageData } from '~/types'
import { isEqual } from 'lodash'
import { without } from '~/lib/utils'


const contentFactory = (dataStore) => {
  createStore(dataStore, 'images', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string', optional: true },
    { name: 'crop', type: 'string', optional: true },
    { name: 'scale', type: 'number', optional: true },
    { name: 'syncSize', type: 'boolean', optional: true },
    { name: 'content_id', type: 'string' },
    { name: 'project_id', type: 'string' }
  ], {
    actions: {
      async forContent(store: leafI, contentId: string) {
        const content = store.parent!.child('content')!.value.get(contentId)?.content;
        if (!content) {
          throw new Error('cannot find content ' + contentId);
        }

        // see if it's in the local store
        const [markdown] = store.do.find([
          { field: 'content_id', value: contentId }
        ]);
        if (markdown) {
          return markdown;
        }

        // check the database
        const engine = dataStore.getMeta('engine');
        const { data, error } = await engine.query(
          'images',
          [
            { field: 'content_id', value: contentId }
          ]);
        if (error) {
          throw error;
        }
        if (data?.[0]) {
          return store.do.add(data[0]);
        } else {
          console.warn('no markdown record for content id ', contentId);
        }
        // create a new one
        const newMarkdown = {
          name: '',
          project_id: content.project_id,
          content_id: contentId
        };
        const record = store.do.add(newMarkdown);
        return store.do.save(record.id);
      },
      async updateImage(store: leafI, image: ImageData, content: Content) {
        let currentImageRecord = await store.do.forContent(content.id)
          .catch((e) => { // it is possible that there is not an initial content for image
            console.warn('no current markdown');
            const newImage = {
              ...image,
              project_id: content.project_id,
              frame_id: content.frame_id,
              content_id: content.id,
            };
            const r = store.do.add(newImage);
            return store.do.save(r.id);
          });

        // note - it is possible that on the first hit of this if there is not a current image item,
        // the data will be saved twice, but that is better than, uh, not saving it?
        // also - with markdown, given the limited property set, we check

        const { content: imageContent, id } = currentImageRecord;
        const FIELDS = ['project_id', 'frame_id', 'content_id'];

        if (imageContent.project_id === content.project_id
          && imageContent.frame_id === content.frame_id
          && imageContent.content_id === content.id
          && isEqual(without(imageContent, FIELDS), without(image, FIELDS))
        ) {
          return currentImageRecord; // data doesn't need to be saved- it is good.
        }
        const newImageContent = {
          ...imageContent,
          ...image,
          project_id: content.project_id,
          frame_id: content.frame_id,
          content_id: content.id,
        };
        store.do.add(newImageContent);
        return store.do.save(id);
      },
      async deleteForContent(store: leafI, contentId: string) {
        const items = store.do.find([{ field: 'content_id', value: contentId }]);
        if (!items.length) return;
        const engine = dataStore.getMeta('engine');
        // delete the remote values
        for (const imageRecord of items) {
          await engine.do.deleteId('images', imageRecord.id);
        }
        // delete the local values
        store.do.mutate((values) => {
          for (const imageRecord of items) {
            values.delete(imageRecord.id);
          }
        });
      }
    }
  });
}

export default contentFactory;

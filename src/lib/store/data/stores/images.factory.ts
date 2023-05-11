import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Content, ImageData } from '~/types'


const contentFactory = (store) => {
  createStore(store, 'images', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string' , optional: true},
    { name: 'crop', type: 'string' , optional: true},
    { name: 'scale', type: 'number' , optional: true},
    { name: 'syncSize', type: 'boolean' , optional: true},
    { name: 'content_id', type: 'string' },
    { name: 'project_id', type: 'string' }
  ], {
    actions: {
      async forContent(store: leafI, contentId: string) {
        const content = store.parent!.child('content')!.value.get(contentId)?.content;
        if (!content) throw new Error('cannot find content ' + contentId);

        // see if it's in the local store
        const [markdown] = store.do.find([
          { field: 'content_id', value: contentId }
        ]);
        if (markdown) {
          return markdown;
        }

        // check the database
        const engine = store.parent!.getMeta('engine');
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
      async updateImage(mkState: leafI, image: ImageData, content: Content) {
        let currentImageRecord = await mkState.do.forContent(content.id);
        if (!currentImageRecord) { // it is possible that there is not an initial content for image
          const newImage = {
            project_id: content.project_id,
            frame_id: content.frame_id,
            content_id: content.id,
            title: image.title,
            text: image.text
          };
         const r =  mkState.do.add(newImage);
         return mkState.do.save(r.id);
        }

        const currentImage = currentImageRecord.content;
        // check difference of new data -- currently only updating title, text field
        if (currentImage.title !== image.title ||
        currentImage.text !== image.text) {
          const newImageContent = { ...currentImage, title: image.title, text: image.text };

          mkState.do.add(newImageContent);
          return mkState.do.save(image.id);
        }
      }
    }
  });
}

export default contentFactory;

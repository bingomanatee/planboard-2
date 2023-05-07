import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Content } from 'next/dist/compiled/@next/font/dist/google'


const contentFactory = (store) => {
  createStore(store, 'markdown', [
    { name: 'id', type: 'string', primary: true },
    { name: 'title', type: 'string' },
    { name: 'text', type: 'string' },
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
          'markdown',
          [
            { field: 'content_id', value: contentId }
          ]);
        if (error) {
          throw error;
        }
        if (data?.[0]) {
          return store.do.add(data[0]);
        }
        // create a new one
        const newMarkdown = {
          title: 'Untitled',
          text: '',
          project_id: content.project_id,
          content_id: contentId
        };
        console.log('making markdown', newMarkdown, 'from content', content);
        const record = store.do.add(newMarkdown);
        return store.do.save(record.id);
      }
    }
  });
}

export default contentFactory;

import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Content, MarkdownData } from '~/types'
import { Engine } from '~/lib/store/types'


const contentFactory = (dataStore: leafI, engine: Engine) => {
  createStore(dataStore, 'markdown', [
    { name: 'id', type: 'string', primary: true },
    { name: 'title', type: 'string' },
    { name: 'text', type: 'string' },
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
        } else {
          console.warn('no markdown record for content id ', contentId);
        }
        // create a new one
        const newMarkdown = {
          title: 'Untitled',
          text: '',
          project_id: content.project_id,
          content_id: contentId
        };
        const record = store.do.add(newMarkdown);
        return store.do.save(record.id);
      },
      async updateMarkdown(mkState: leafI, markdown: MarkdownData, content: Content) {
        let currentMarkdownRecord = await mkState.do.forContent(content.id)
          .catch(() => { // no current record
            const newMarkdown = {
              project_id: content.project_id,
              frame_id: content.frame_id,
              content_id: content.id,
              title: markdown.title,
              text: markdown.text
            };
            const r = mkState.do.add(newMarkdown);
            return mkState.do.save(r.id);
          });

        const currentMarkdown = currentMarkdownRecord.content;
        // check difference of new data -- currently only updating title, text field
        if (currentMarkdown.title !== markdown.title ||
          currentMarkdown.text !== markdown.text) {
          const newMarkdownContent = { ...currentMarkdown, title: markdown.title, text: markdown.text };

          mkState.do.add(newMarkdownContent);
          return mkState.do.save(markdown.id);
        }
      },
      async deleteForContent(store: leafI, contentId: string) {
        const items = store.do.find([{ field: 'content_id', value: contentId }]);
        if (!items.length) return;
        // delete the remote values
        for (const imageRecord of items) {
          await engine.do.deleteId('markdown', imageRecord.id);
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

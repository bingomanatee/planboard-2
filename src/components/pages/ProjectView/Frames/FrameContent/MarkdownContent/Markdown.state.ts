import { Content } from '~/types'
import { leafI } from '@wonderlandlabs/forest/lib/types'

const MarkdownState = (props, dataStore: leafI) => {
  const content = props.content
  const { frame_id: frameId, id: contentId } = (content || {});
  return {
    $value: { frameId, contentId, markdown: null, id: null },
    selectors: {},
    actions: {
      async loadContent(store: leafI) {
        let markdownRecord = await dataStore.child('markdown')!
          .do.forContent(content.id);
        store.do.set_markdown(markdownRecord.content);
        store.do.set_id(markdownRecord.id);
      }
    }
  };
};

export default MarkdownState;

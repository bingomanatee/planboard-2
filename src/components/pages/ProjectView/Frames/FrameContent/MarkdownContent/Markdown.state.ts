import { Content } from '~/types'
import { leafI } from '@wonderlandlabs/forest/lib/types'

const MarkdownState = (props, dataStore: leafI) => {
  console.log('markdownState: props = ', props);
  const content = props.content
  const { frame_id: frameId, id: contentId } = (content || {});
  return {
    $value: { frameId, contentId, markdown: null },
    selectors: {},
    actions: {
      async loadContent(store: leafI) {
        let markdownRecord = await dataStore.child('markdown')!
          .do.forContent(content.id);
        store.do.set_markdown(markdownRecord.content);
      }
    }
  };
};

export default MarkdownState;

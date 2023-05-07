import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'


const contentFactory = (store) => {
  createStore(store, 'content', [
    { name: 'id', type: 'string', primary: true },
    { name: 'type', type: 'string' },
    { name: 'frame_id', type: 'string' },
    { name: 'project_id', type: 'string' }
  ], {
    actions: {
      async deleteContentForFrame(store: leafI, frameId: string) {
        const engine = store.parent!.getMeta('engine');
        try {
          const { data } = await engine.query('content', [{ field: 'frame_id', value: frameId }]);
          console.log('--- items to delete:', data);
          if (data?.length) {
            const ids = data.map((item) => item.id);
            console.log('oldContent:', ids);
            await engine.deleteIds('content', ids);
          }
        } catch (err) {
          console.warn('error deleting content for ', frameId, err);
        }
      }
    }
  });
}

export default contentFactory;
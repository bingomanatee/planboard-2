import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Content } from '~/types'
import { Engine } from '~/lib/store/types'
import { dataOrThrow } from '~/lib/utils'


const contentFactory = (dataStore: leafI, engine: Engine) => {
  const NAME = 'content';
  createStore(dataStore, NAME, [
    { name: 'id', type: 'string', primary: true },
    { name: 'type', type: 'string' },
    { name: 'frame_id', type: 'string' },
    { name: 'project_id', type: 'string' }
  ], {
    actions: {
      async  loadForProject(store: leafI, id: string) {
        const data = await dataOrThrow(engine.query(NAME, [
          { field: 'project_id', value: id }
        ]));
        store.do.addMany(data, true);
        return data;
      },
      async deleteContentForFrame(store: leafI, frameId: string) {
        try {
          const { data } = await engine.query(NAME, [{ field: 'frame_id', value: frameId }]);
          if (data?.length) {
            const ids = data.map((item) => item.id);
            for(const c of data) {
              let content = c as Content;
              switch (content.type){
                case 'markdown':
                  await dataStore.child('markdown')!.do.deleteForContent(content.id);
                  break;

                case 'image':
                  await dataStore.child('images')!.do.deleteForContent(content.id);
                  break;
              }
            }
            await engine.deleteIds('content', ids);
          }
        } catch (err) {
          console.warn('error deleting content for ', frameId, err);
        }
      },
      forFrame(store: leafI, frameId: string) {
       // assumes content has been loaded
        // AND that there is only one.
        return store.do.find([{field: 'frame_id', value: frameId}], true)
      }
    }
  });
}

export default contentFactory;

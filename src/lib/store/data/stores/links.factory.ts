import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Engine } from '~/lib/store/types'
import { combine } from '~/lib/store/data/utils'
import { dataOrThrow } from '~/lib/utils'

export type LinkDir = 'from' | 'to';
const NAME = 'links';

const contentFactory = (dataStore: leafI, engine: Engine) => {
  createStore(dataStore, NAME, [
    { name: 'id', type: 'string', primary: true },
    { name: 'label', type: 'string', optional: true },
    { name: 'style', type: 'string', optional: true }, // JSON format describer
    { name: 'from_frame_id', type: 'string' },
    { name: 'to_frame_id', type: 'string' },
    { name: 'project_id', type: 'string' }
  ], {
    selectors: {
      // note -- at this point we are ignoring the project id in frame searches
      // becase frame IDs are implicitly bound to their projects.
      forFrame(store: leafI, frameId: string, role: LinkDir = "all") {
        const items = (role === 'to') ? [] : store.$.find([{ field: 'from_frame_id', value: frameId }]);
        const toItems = (role === 'from') ? [] : store.$.find([{ field: 'to_frame_id', value: frameId }]);
        return combine(items, toItems);
      },
      between(store: leafI, frameId: string, frameTo: string) {
        const links = store.$.find([{ field: 'from_frame_id', frameId }, { field: 'to_frame_id', value: frameTo }])
        const linksTo = store.$.find([{ field: 'from_frame_id', frameTo }, { field: 'to_frame_id', value: frameId }])
        return combine(links, linksTo);
      }
    },
    actions: {
      async linkFrames(store: leafI, projectId: string, fromFrame: string, toFrame: string) {

        const existing = store.$.between(fromFrame, toFrame);
       if (existing.length) {
         console.warn('attempting to link two frames that are already linked:',
           fromFrame, toFrame, existing);
         return;
       }
        const data = {
          project_id: projectId,
          from_frame_id: fromFrame,
          to_frame_id: toFrame,
        }
       const record = store.do.add(data);
       await store.do.save(record.id);
       return record;
      },
      async loadForProject(store: leafI, projectId: string) {
        const links = await dataOrThrow(engine.query(NAME, [
          { field: 'project_id', value: projectId }
        ]));
        store.do.addMany(links, true);
        return links;
      },
      async deleteForFrame(store: leafI, frameId: string) {
        const items = store.$.forFrame(frameId, 'all');
        const linkIds = items.map((item) => item.id);
        store.do.deleteIds(NAME, linkIds);
      }
    }
  });
}

export default contentFactory;

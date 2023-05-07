import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import { c } from '@wonderlandlabs/collect'
import { StoreRecord } from '~/lib/store/types'
import { Frame } from '~/types'

const framesFactory = (store) => {
  createStore(store, 'frames', [
    { name: 'id', type: 'string', primary: true },
    { name: 'name', type: 'string', optional: true },
    { name: 'created_at', type: 'string', optional: true },
    { name: 'project_id', type: 'string', optional: true },
    { name: 'top', type: 'number' },
    { name: 'left', type: 'number' },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
  ], {
    actions: {
      createFrame(state: leafI, project_id, start: Vector2, end: Vector2) {
        if (project_id && start && end) {
          const order = c(state.value).getReduce((ord, store: StoreRecord<string, Frame>) => {
            if (store.content.order > ord) {
              return store.content.order;
            }
            return ord;
          }, 0) + 1;

          const newFrame = {
            project_id,
            left: start.x,
            top: start.y,
            width: end.x - start.x,
            height: end.y - start.y,
            order
          };

          const record = state.do.add(newFrame);
          state.do.save(record.id);
        } else {
          console.log('missing data:', project_id, start, end);
        }
      }

    }
  });
}

export default framesFactory;

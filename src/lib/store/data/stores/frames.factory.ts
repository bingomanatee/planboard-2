import { createStore } from '~/lib/store/data/createStore'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import { c } from '@wonderlandlabs/collect'
import { Engine, StoreRecord } from '~/lib/store/types'
import { Frame } from '~/types'
import { dataOrThrow } from '~/lib/utils'

const framesFactory = (store: leafI, engine: Engine) => {
  const NAME = 'frames';
  createStore(store, NAME, [
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
      createFrame(state: leafI, project_id, p1: Vector2, p2: Vector2) {
        if (project_id && p1 && p2) {
          const start = new Vector2(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
          const end = new Vector2(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));
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
          console.warn('missing data:', project_id, p1, p2);
        }
      },
      async updateFrame(frState: leafI, frame: Frame) {
        const currentFrameRecord = frState.value.get(frame.id);
        if (!currentFrameRecord) {
          console.warn('cannot find frame', frame.id, 'in', store.value);
          throw new Error('cannot find frame ', frame);
        }
        const currentFrame: Frame = currentFrameRecord.content;
        // check difference of new data -- currently only updating name field
        if (currentFrame.name !== frame.name) {
          const newFrameContent = { ...currentFrame, name: frame.name };
          console.log('saving frame data:', newFrameContent, 'over', currentFrame);
          frState.do.add(newFrameContent);
          return frState.do.save(frame.id);
        }
      },
      setFrameSize(state: leafI, frameId: string, width: number, height: number) {
        const frameRecord = state.value.get(frameId);
        if (!frameRecord) {
          console.warn('cannot find frame ', frameId);
          return;
        }
        width = Math.round(width);
        height = Math.round(height);
        if (frameRecord.content.height === height && frameRecord.content.width === width) {
          console.warn('no size change - not changing data')
          return;
        }
        console.log('updating frame size', width, height);
        const content = { ...frameRecord.content, width, height };
        state.do.add(content, frameId);
        return state.do.save(frameId);
      },
      setFramePos(state: leafI, frameId: string, left: number, top: number) {
        const frameRecord = state.value.get(frameId);
        if (!frameRecord) {
          console.warn('cannot find frame ', frameId);
          return;
        }
        top = Math.round(top);
        left = Math.round(left);
        if (frameRecord.content.left === left && frameRecord.content.top === top) {
          return;
        }
        const content = { ...frameRecord.content, left, top };
        state.do.add(content, frameId);
        return state.do.save(frameId);
      },
      async loadForProject(state: leafI, id: string) {
        const data = await dataOrThrow(engine.query(NAME, [
          { field: 'project_id', value: id }
        ]));
        state.do.addMany(data, true);
        return frames;
      }
    }
  });
}

export default framesFactory;

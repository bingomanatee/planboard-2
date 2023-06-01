import { BehaviorSubject, map, Observable } from 'rxjs'
import { StoreRecord } from '~/lib/store/types'
import { c } from '@wonderlandlabs/collect'
import { Content, Frame } from '~/types'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { byContentReducer } from '~/lib/store/data/utils'
import { sortBy } from 'lodash'

type FrameInfo = { id: string, frame: Frame, content: Content | null, contentData: any };

export type ListFramesStateValue = { selected: string | null, frames: StoreRecord<FrameInfo>[] };

const ListFramesState = (props, dataState) => {
  const $value: ListFramesStateValue = { frames: [], selected: null };
  return {
    $value,

    selectors: {
      initFrameObserver(state: leafI): Observable<any> {
        const dataSubj = new BehaviorSubject(dataState.value);
        let observable = dataSubj
          .pipe(
            map(
              (dataMap: Map<string, StoreRecord>) => {
                const markdown = dataMap.get('markdown')!;
                const images = dataMap.get('images');
                const content = dataMap.get('content');

                const imagesByContent = c(images).getReduce(byContentReducer, new Map());
                const markdownByContent = c(markdown).getReduce(byContentReducer, new Map());
                try {
                  const frameRecords = c(dataMap.get('frames'))
                    .map((r: StoreRecord, id) => ({
                      id,
                      frame: r.content,
                      content: null,
                      contentData: null,
                    }));
                  // update frameRecords with content
                  c(content!)
                    .forEach((r: StoreRecord) => {
                      const content: Content = r.content;
                      if (frameRecords.hasKey(content.frame_id)) {
                        const frameData = frameRecords.get(content.frame_id);
                        frameData.content = content;
                        switch (content.type) {
                          case 'markdown':
                            if (markdownByContent.has(r.id)) {
                              frameData.contentData = markdownByContent.get(r.id).content;
                            }
                            break;

                          case 'image':
                            if (imagesByContent.has(r.id)) {
                              frameData.contentData = imagesByContent.get(r.id).content;
                            }
                            break;
                        }
                      }
                    });

                  return frameRecords.value;
                } catch (error) {
                  console.warn('ifo error: ', error);
                  return new Map();
                }
              }), // end map
          );

        const sub = dataState.subscribe((value) => dataSubj.next(value));

        state.setMeta('observable', observable);
        state.setMeta('sub', sub);
        return observable;
      },
      currentFrame(state: typedLeaf<ListFramesStateValue>) {
        const { selected, frames } = state.value;
        if (!selected) {
          return null;
        }
        return frames.find((fi) => fi.id === selected) || null;
      }
    },

    actions: {
      toggleSelectFrame(state: leafI, frameId) {
        if (frameId === state.value.selected) {
          state.do.set_selected(null);
        } else {
          state.do.set_selected(frameId);
        }
      },
      watchFrames(state: leafI) {
        let observable = state.getMeta('observable');
        if (!observable) {
          observable = state.$.initFrameObserver();
        }
        observable.pipe(map((frames) => {
          return sortBy(Array.from(frames.values()), 'frame.order');
        })).subscribe(state.do.set_frames);
      },
      moveFrames(state: typedLeaf<ListFramesStateValue>, reorder) {
        const { selected } = state.value;
        if (!selected) {
          return;
        }
        const newFrames: FrameInfo[] = [];

        for (const fi of reorder()) {
          newFrames.push(fi);
        }

        const map = new Map();
        let newOrder = 1;
        newFrames.forEach((record) => {
          map.set(record.id, newOrder);
          newOrder += 1;
        });
        dataState.child('frames')!.do.reorder(map);
      },
      moveTop(state: typedLeaf<ListFramesStateValue>) {
        const { selected, frames } = state.value;
        const current: FrameInfo | null = state.$.currentFrame();
        state.do.moveFrames(function* reorder() {
          yield current;
          for (let fi of frames) {
            if (fi.id !== selected) {
              yield fi;
            }
          }
        });
      },
      moveDown(state: leafI) {
        const { selected, frames } = state.value;
        const current: FrameInfo | null = state.$.currentFrame();
        const next = frames.reduce((memo, fi, index) => {
          if (memo) {
            return memo;
          }
          if (frames[index - 1]?.id === selected) {
            return fi;
          }
          return memo;
        }, null);

        if (!next) {
          return;
        }

        state.do.moveFrames(function* reorder() {
          for (let fi of frames) {
            if (fi.id === selected) {
              yield next;
            } else if (fi.id === next?.id) {
              yield current;
            } else {
              yield fi;
            }
          }
        });
      },
      moveUp(state: leafI) {
        console.log('move up');
        const { selected, frames } = state.value;
        const current: FrameInfo | null = state.$.currentFrame();
        const prev = frames.reduce((memo, fi, index) => {
          if (memo) {
            return memo;
          }
          const nextOne = frames[index + 1];
          console.log(index, 'nextOne = ', nextOne);
          if (nextOne.id === selected) {
            return fi;
          }
          return memo;
        }, null);

        if (!prev) {
          return;
        }
        state.do.moveFrames(function* reorder() {
          for (let fi of frames) {
            if (fi.id === selected) {
              yield prev;
            } else if (fi.id === prev?.id) {
              yield current;
            } else {
              yield fi;
            }
          }
        });
      },
      moveBottom(state: leafI) {
        const { selected, frames } = state.value;
        const current: FrameInfo | null = state.$.currentFrame();
        state.do.moveFrames(function* reorder() {
          for (let fi of frames) {
            if (fi.id !== selected) {
              yield fi;
            }
          }
          yield current;
        });
      }
    }
  };
};

export default ListFramesState;

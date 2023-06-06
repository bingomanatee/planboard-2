import { BehaviorSubject, map, Observable } from 'rxjs'
import { StoreRecord } from '~/lib/store/types'
import { c } from '@wonderlandlabs/collect'
import { Content, Frame, Link } from '~/types'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { byContentReducer } from '~/lib/store/data/utils'
import { sortBy } from 'lodash'
import { FrameInfo } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/types'
import { collectObj } from '@wonderlandlabs/collect/lib/types'
import { LinkDir, linkVector } from '~/lib/store/data/stores/links.factory'

export type ListFramesStateValue = {
  selected: string | null,
  lockSelected: string | null,
  frames: StoreRecord<FrameInfo>[],
  mode: string,
  linksFor: string | null
};

type FrameData = {
  id: string,
    frame: Frame,
  content?: Content | null,
  contentData?: any | null,
  links:  Map<string, linkVector[]>
}

type leafType = typedLeaf<ListFramesStateValue>;

const ListFramesState = (props, dataState) => {
  const $value: ListFramesStateValue = { frames: [], linksFor: null, selected: null, lockSelected: null, mode: 'standard', };
  return {
    $value,

    selectors: {
      initFrameObserver(state: leafType): Observable<any> {
        const dataSubj = new BehaviorSubject(dataState.value);
        let observable = dataSubj // @todo: watch and update only changed properties;
          .pipe(
            map(
              (dataMap: Map<string, StoreRecord>) => {
                const markdown = dataMap.get('markdown')!;
                const images = dataMap.get('images');
                const content: Map<string, StoreRecord<string, Content>> = dataMap.get('content')!;
                const links: Map<string, StoreRecord<string, Link>> = dataMap.get('links')!;

                const imagesByContent = c(images).getReduce(byContentReducer, new Map());
                const markdownByContent = c(markdown).getReduce(byContentReducer, new Map());
                try {
                  const frameRecords = c(dataMap.get('frames'))
                    .map((r: StoreRecord, id) => ({
                      id,
                      frame: r.content,
                      content: null,
                      contentData: null,
                      links: []
                    }));
                  // update frameRecords with content
                  content.forEach((r: StoreRecord<string, Content>) => {
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

                  links.forEach((r: StoreRecord<string, Link>) => {
                    const link: Link = r.content;
                    const {to_frame_id, from_frame_id} = link;
                    frameRecords.get(to_frame_id)?.links.push(link);
                    frameRecords.get(from_frame_id)?.links.push(link);
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
      currentFrame(state: leafType) {
        const { selected, frames } = state.value;
        if (!selected) {
          return null;
        }
        return frames.find((fi) => fi.id === selected) || null;
      }
    },

    actions: {
      viewAll(state: leafType) {
        state.do.set_mode('links-all');
      },
      unlock(state: leafType) {
        state.do.set_lockSelected(null);
        state.do.set_mode('standard');
        state.do.set_selected(null);
      },
      clickFrame(state: leafType, frameId) {
        const { lockSelected } = state.value;
        state.do.set_selected(frameId);
        state.do.set_lockSelected(frameId === lockSelected ? null : frameId)
      },
      overFrame(state: leafType, frameId) {
        const { lockSelected } = state.value;
        if (!lockSelected) {
          state.do.set_selected(frameId);
        }
      },
      showLinks(state: leafType, id: string) {
        state.do.set_linksFor(id);
      },
      watchFrames(state: leafType) {
        let observable = state.getMeta('observable');
        if (!observable) {
          observable = state.$.initFrameObserver();
        }
        observable.pipe(map((frames) => {
          return sortBy(Array.from(frames.values()), 'frame.order');
        })).subscribe(state.do.set_frames);
      },
      moveFrames(state: leafType, reorder) {
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
      moveTop(state: leafType) {
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
      moveDown(state: leafType) {
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
      moveUp(state: leafType) {
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
      moveBottom(state: leafType) {
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
      },
      onFrameDetailChange(state: leafType, mode: string) {
        state.do.set_mode((mode === 'Links') ? 'links' : 'standard');
        state.do.set_linksFor(null);
      }
    }
  };
};

export default ListFramesState;

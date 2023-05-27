import { leafI } from '@wonderlandlabs/forest/lib/types'
import { TargetData } from '~/components/pages/ProjectView/ProjectView.state'
import { StoreRecord } from '~/lib/store/types'
import { c } from '@wonderlandlabs/collect'
import { Content } from '~/types'
import { BehaviorSubject, map } from 'rxjs'

function byContentReducer(memo: Map<string, ImageData>, r: StoreRecord) {
  const content_id = r.content.content_id;
  if (content_id) {
    memo.set(content_id, r);
  }
  return memo;
}

/*
this is the compoent that shows ALL the frames (Frames plural).
 */
const FramesViewState = (props, projectState, dataState: leafI) => {
  return {
    $value: { floatId: null, editItem: null, hover: null },
    selectors: {
      initFrameObserver(state: leafI) {
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
        state.setMeta('frameSubscriber', sub); //@TODO: close;
        state.setMeta('frameObserver', observable, true);
        return observable;
      },
      frameObserver(state: leafI, frameId) {
        const obs = state.getMeta('frameObserver') || state.$.initFrameObserver();
        return obs.pipe(
          map((r) => r.get(frameId)),
        )
      }
    },
    actions: {
      hover(state: leafI, hoverId) {
        state.do.set_hover(hoverId);
      },
      unHover(state: leafI) {
        state.do.set_hover(null);
      },
      edit(state: leafI, info: TargetData | null) {
        if (projectState.value.mouseMode) {
          console.warn('ignoring edit click - project mode is ', projectState.value.mouseMode);
          return;
        }
        state.do.set_editItem(info || null);
      },
      move(state: leafI, info: TargetData | null) {
        projectState.do.initMove(info);
      },
      closeEdit(state: leafI) {
        state.do.set_editItem(null);
      },
      float(leaf: leafI, id) {
        const toggleFloat = leaf.getMeta('toggleFloat');
        if (typeof toggleFloat === 'function') {
          toggleFloat();
          leaf.setMeta('toggleFloat', null, true);
        }
        leaf.do.set_floatId(id ?? null);
      }
    }
  };
};

export default FramesViewState;

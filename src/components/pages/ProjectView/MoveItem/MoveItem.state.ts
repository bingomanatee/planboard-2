import { MoveItemProps } from './types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { SVG } from '@svgdotjs/svg.js'
import { isEqual } from 'lodash'
import { numToPx, propsToPx } from '~/lib/utils'
import { Vector2 } from 'three'

const MoveItemState = (props: MoveItemProps, dataState: leafI) => {
  const { projectState }: MoveItemProps = props;
  return {
    $value: {
      target: {
        ...projectState.value.moveItem
      },
      movePosStart: null,
      movePosCurrent: null,
      loaded: false
    },
    selectors: {
      overlayStyle(state: leafI) {
        const { position, movePosCurrent, movePosStart } = state.value;
        const size = propsToPx({ width: position.width, height: position.height });
        if (!(movePosCurrent && movePosStart)) {
          return size;
        }
        const offset = new Vector2(0, 0)
          .sub(movePosStart).add(movePosCurrent);
        const style = { top: offset.y, left: offset.x };
        return { ...propsToPx(style), ...size };
      },
      moveWidgetStyle(state: leafI) {
        console.log('move-widget-loaded')
        if (!state.value.loaded) {
          return {overflow: 'auto'};
        }
        const { left, top } = state.value.position;
        console.log('moveWidgetStyle based on ', state.value);
        return propsToPx({ left, top });
      }
    },
    children: {
      position: {
        $value: { top: 0, left: 0, width: 0, height: 0 },
        selectors: {
        }
      }
    },
    actions: {
      startMoveDrag(state: leafI, eFirst: MouseEvent) {
        console.log('starting move drag');
        eFirst.stopPropagation();

        const moveListener = (e: MouseEvent) => {
          console.log('moveDrag listener');
          e.stopPropagation();
          state.do.updateMove(e);
        }

        const completeMoveListener = (e) => {
          state.do.moveFrame();
          e.stopPropagation();
          window.removeEventListener('mousemove', moveListener);
          window.removeEventListener('mouseup', completeMoveListener);
          state.do.set_movePosStart(null);
          state.do.set_movePosCurrent(null);
          projectState.do.completeMove(); // terminate the move state globally
        }

        window.addEventListener('mousemove', moveListener);
        window.addEventListener('mouseup', completeMoveListener);

        state.do.set_movePosStart(new Vector2(eFirst.x, eFirst.y));
        state.do.set_movePosCurrent(new Vector2(eFirst.x, eFirst.y));
      },
      updateMove(state: leafI, e: MouseEvent) {
        e.stopPropagation();
        console.log('updateMove: ', e)
        state.do.set_movePosCurrent(new Vector2(e.x, e.y));
      },

      moveFrame(state: leafI){
        const { id } = state.value.target;
        const { movePosCurrent } = state.value;

        const left =  movePosCurrent.x;
        const top =  movePosCurrent.y;
        dataState.child('frames')!.do.setFramePos(id, left, top);
      },
      init(state: leafI, div: HTMLDivElement) {
        const { id, type } = state.value.target;
        // const draw = SVG().addTo(div).size('100%', '100%');
        // state.setMeta('draw', draw, true);
        switch (type) {
          case 'frame':
            const frameState = dataState.child('frames')!;
            const watchSub = frameState.$.watchId(id, (itemRecord) => {
              if (!itemRecord) {
                return;
              }
              const { top, left, width, height } = itemRecord.content;
              if (!isEqual(state.value.position, { top, left, width, height })) {
                state.child('position')!.value = { top, left, width, height };
                state.do.set_loaded(true);
              }
            });
            state.setMeta('watchSub', watchSub, true);
            break;
          // currently only frames move.
        }
      }
    }
  };
};

export default MoveItemState;

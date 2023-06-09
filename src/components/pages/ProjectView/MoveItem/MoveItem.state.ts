import { MoveItemProps } from './types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { SVG } from '@svgdotjs/svg.js'
import { isEqual } from 'lodash'
import { numToPx, propsToPx, toPoint } from '~/lib/utils'
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
          .sub(movePosStart).add(movePosCurrent).sub(projectState.value.screenOffset)
        const style = { top: offset.y, left: offset.x };
        return { ...propsToPx(style), ...size };
      },
      moveWidgetStyle(state: leafI) {
        if (!state.value.loaded) {
          return { overflow: 'auto' };
        }
        const { left, top } = state.value.position;
        return propsToPx({ left, top });
      }
    },
    children: {
      position: {
        $value: { top: 0, left: 0, width: 0, height: 0 },
        selectors: {}
      }
    },
    actions: {
      moveListener(state: leafI, e: MouseEvent) {
        e.stopPropagation();
        state.do.updateMove(e);
      },
      completeMoveListener(state: leafI, e) {
        state.do.moveFrame();
        e.stopPropagation();
        window.removeEventListener('mousemove', state.do.moveListener);
        window.removeEventListener('mouseup', state.do.completeMoveListener);
        state.do.set_movePosStart(null);
        state.do.set_movePosCurrent(null);
        projectState.do.completeMove(); // terminate the move state globally
      },
      startMoveDrag(state: leafI, eFirst: MouseEvent) {
        console.log('MovevItem.state.starMoveDrag')
        eFirst.stopPropagation();
        window.addEventListener('mousemove', state.do.moveListener);
        window.addEventListener('mouseup', state.do.completeMoveListener);

        state.do.set_movePosStart(new Vector2(eFirst.x, eFirst.y));
        state.do.set_movePosCurrent(new Vector2(eFirst.x, eFirst.y));
      },
      updateMove(state: leafI, e: MouseEvent) {
        e.stopPropagation();
        state.do.set_movePosCurrent(toPoint(e));
      },
      moveFrame(state: leafI) {
        const { id } = state.value.target;
        const { movePosCurrent } = state.value;
        const final = movePosCurrent
          .clone()
          .sub(projectState.value.screenOffset)
          .round();
        const left = final.x;
        const top = final.y;
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

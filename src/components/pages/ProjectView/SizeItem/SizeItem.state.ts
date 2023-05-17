import { SizeItemProps } from './types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { SVG } from '@svgdotjs/svg.js'
import { isEqual } from 'lodash'
import { numToPx, propsToPx } from '~/lib/utils'
import { Vector2 } from 'three'

const SizeItemState = (props: SizeItemProps, dataState: leafI) => {
  const { projectState }: SizeItemProps = props;
  return {
    $value: {
      target: {
        ...projectState.value.moveItem
      },
      sizePosStart: null,
      sizePosCurrent: null,
      loaded: false
    },
    selectors: {
      size(state: leafI) {
        const { left, top, width, height } = state.value.position;
        const { sizePosCurrent } = state.value;
        if (!sizePosCurrent) {
          return { width, height };
        }
        const relPos = sizePosCurrent
          .clone()
          .sub(projectState.value.screenOffset);
        const newWidth = relPos.x - left;
        const newHeight = relPos.y - top;
        return { width: newWidth, height: newHeight };
      },

      overlayStyle(state: leafI) {
        const { sizePosCurrent } = state.value;
        const { left, top, width, height } = state.value.position;
        const pos = propsToPx({
          left, top,
        });

        const size = propsToPx(state.$.size());
        const style = { ...size, ...pos };
        console.log('sizeWidgetStyle based on is', style, 'based on ', state.value);
        return style;
      },
      sizeWidgetStyle(state: leafI) {
        console.log('size-widget-loaded')
        if (!state.value.loaded) {
          return { overflow: 'auto' };
        }
        const { left, width, height, top } = state.value.position;
        console.log('sizeWidgetStyle based on ', state.value);
        return propsToPx({ left: left + width, top: top + height });
      }
    },
    children: {
      position: {
        $value: { top: 0, left: 0, width: 0, height: 0 },
        selectors: {}
      }
    },
    actions: {
      startSizeDrag(state: leafI, eFirst: MouseEvent) {
        console.log('starting size drag');
        eFirst.stopPropagation();

        const sizeListener = (e: MouseEvent) => {
          console.log('moveDrag listener');
          e.stopPropagation();
          state.do.updateSize(e);
        }

        const completeSizeListener = (e) => {
          e.stopPropagation();
          state.do.updateFrameSize();
          window.removeEventListener('mousemove', sizeListener);
          window.removeEventListener('mouseup', completeSizeListener);
          state.do.set_sizePosStart(null);
          state.do.set_sizePosCurrent(null);
          projectState.do.completeMove(); // terminate the size state globally
        }

        window.addEventListener('mousemove', sizeListener);
        window.addEventListener('mouseup', completeSizeListener);

        state.do.set_sizePosStart(new Vector2(eFirst.x, eFirst.y));
        state.do.set_sizePosCurrent(new Vector2(eFirst.x, eFirst.y));
      },
      updateSize(state: leafI, e: MouseEvent) {
        e.stopPropagation();
        console.log('updateSize: ', e)
        state.do.set_sizePosCurrent(new Vector2(e.x, e.y));
      },

      updateFrameSize(state: leafI) {
        const { id } = state.value.target;
        const size = state.$.size();
        console.log('sizing frame with ', size);
        dataState.child('frames')!.do.setFrameSize(id, size.width, size.height);
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
          // currently only frames size.
        }
      }
    }
  };
};

export default SizeItemState;

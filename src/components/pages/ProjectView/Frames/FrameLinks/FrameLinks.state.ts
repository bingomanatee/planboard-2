import { SVG } from '@svgdotjs/svg.js'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Frame, Link } from '~/types'
import { StoreRecord } from '~/lib/store/types'
import { extent, extents } from '~/lib/utils'
import { Vector2 } from 'three'
import { sortBy } from 'lodash'

export type FrameLinksStateValue = {};
const COLOR = 'rgba(51,51,51,0.75)';

function candidates(frame: Frame, extent: extents) {
  let points = [extent.cm];

  console.log('candidates for frame', frame);
  switch (frame.style?.mode) {
    case 'corner':
      points.push(extent.lt, extent.rt, extent.lb, extent.rb);
      break;

    case 'side':
      points.push(extent.lm, extent.rm, extent.ct, extent.cb);
      break;

    case 'corner or side':
      points.push(Array.from(Object.values(extent)));
      break;
  }
  return points;
}

type VectorOrNull = Vector2 | null;
type Line = { start: VectorOrNull, end: VectorOrNull, distance: number };


function bestLine(from: Frame, toFrame: Frame, fromExtent: Record<string, Vector2>, toExtent: extents): Line {
  const fromCandidates = candidates(from, fromExtent);
  const toCandidates = candidates(toFrame, toExtent);

  return sortBy(fromCandidates.map((start) => toCandidates.map(end => ({
    start, end, distance: start.distanceTo(end)
  }))).flat(), 'distance')[0]
}

const FrameLinksState = (props, projectState, dataState, containerRef) => {
  const $value: FrameLinksStateValue = {
    links: new Map(dataState.child('links')!.value),
    frames: new Map(dataState.child('frames')!.value)
  };
  return {
    $value,

    selectors: {
      clearRef() {
        while (containerRef.current?.firstChild) {
          containerRef.current.removeChild(containerRef.current.lastChild);
        }
      },

      renderLinks(state: leafI) {
        state.$.clearRef();

        const draw = SVG().addTo(containerRef.current)
          .size('100%', '100%');
        const frames = dataState.child('frames')!;

        const extentMap = new Map();

        state.value.links.forEach((link: StoreRecord<Link>, id) => {
          const linkContent: Link = link.content;
          const fromFrame = frames.get(linkContent.from_frame_id)?.content;
          const toFrame = frames.get(linkContent.to_frame_id)?.content;
          if (!(fromFrame && toFrame)) {
            return;
          }

          if (fromFrame && toFrame) {
            const fromDir = extentMap.get(fromFrame.id) || extent(fromFrame);
            const toDir = extentMap.get(toFrame.id) || extent(toFrame);

            extentMap.set(fromFrame.id, fromDir);
            extentMap.set(toFrame.id, toDir);

            const line = bestLine(fromFrame, toFrame, fromDir, toDir);
            if (line.start && line.end) {
              draw.line([line.start.toArray(), line.end.toArray()])
                .stroke({ width: 4, color: COLOR });
            }
          }
        })
      }
    },

    actions: {}
  };
};

export default FrameLinksState;

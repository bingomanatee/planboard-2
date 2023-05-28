import { SVG } from '@svgdotjs/svg.js'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Link } from '~/types'
import { StoreRecord } from '~/lib/store/types'
import { extent } from '~/lib/utils'

export type FrameLinksStateValue = {};
const COLOR = 'rgba(51,51,51,0.75)'

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

        state.value.links.forEach((link: StoreRecord<Link>, id) => {
          const linkContent: Link = link.content;
          const fromFrame = frames.get(linkContent.from_frame_id);
          const toFrame = frames.get(linkContent.to_frame_id);
          if (fromFrame && toFrame) {
            const fromDir = extent(fromFrame.content);
            const toDir = extent(toFrame.content);
            const fromPt = fromDir.cm;
            const toPt = toDir.cm;

            draw.line([fromPt.toArray(), toPt.toArray()])
              .stroke({ width: 4, color: COLOR });
          }
        })
      }
    },

    actions: {}
  };
};

export default FrameLinksState;

import { useEffect, useRef, useContext, memo } from 'react';
import styles from './DrawLink.module.scss';
import { SVG } from '@svgdotjs/svg.js'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { extent } from '~/lib/utils'
import useForest from '~/lib/useForest'
import stateFactory from './DrawLink.state.ts';

type DrawLinkProps = { linkStartId: string, linkEndId: string }
const COLOR = 'rgb(128,0,153)';
const RAD = 20;

function DrawLink(props: DrawLinkProps) {
  const { linkStartId, linkEndId } = props;
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const [value,state] = useForest([stateFactory, props, dataState, containerRef]);

  const {startFrame, endFrame, startShadow, endShadow} = value;

  useEffect(() => state.do.update(linkStartId, linkEndId),
    [state, linkStartId, linkEndId]);

  useEffect(() => {
    state.$.clearRef();

    try {
      if (!(startFrame && endFrame) || (startShadow === endShadow)) {
        return;
      }

      const startDir = extent(startFrame.content);
      const endDir = extent(endFrame.content);

      const draw = SVG().addTo(containerRef.current)
        .size('100%', '100%');
      draw.line(
        startDir.cm.x, startDir.cm.y,
        endDir.cm.x, endDir.cm.y
      )
        .stroke({ width: 10, color: COLOR });
      draw.circle(RAD).fill(COLOR).move(startDir.cm.x - RAD/2, startDir.cm.y - RAD/2)
      draw.circle(RAD).fill(COLOR).move(endDir.cm.x - RAD/2, endDir.cm.y - RAD/2)
    } catch (err) {
      console.log('svg error:', err);
    }
  }, [dataState.value, startFrame, endFrame, startShadow, endShadow, state.$])

  return (<div data-role="link-svg" className={styles.container} ref={containerRef}>

  </div>);
}

const MemoizedDrawLink = memo(DrawLink);

export default MemoizedDrawLink;

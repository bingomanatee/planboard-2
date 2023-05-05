import { useState, useEffect, useContext, useMemo } from 'react';
import { Text, Box } from 'grommet';
import styles from './FramesView.module.scss';
import stateFactory from './FramesView.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import useForestFiltered from '~/lib/useForestFiltered'
import { c } from '@wonderlandlabs/collect'
import { Frame } from '~/types'
import { StoreRecord } from '~/lib/store/types'
import { sortBy } from 'lodash'
import { numToPx } from '~/lib/utils'
import { BoxColumn } from '~/components/BoxVariants'

type FramesViewProps = {
  projectId: string
}

function Frame({ id, frame }) {
  const style = useMemo(() => {
    return {
      left: numToPx(frame.left),
      top: numToPx(frame.top),
      width: numToPx(frame.width),
      height: numToPx(frame.height),
      zIndex: ((frame.order || 0) * 100 + 1)
    }
  }, [frame])

  return <div className={styles.frame} style={style}>
    <BoxColumn fill border={{ color: 'frame-border', size: '2px' }}>
      <p>Frame id: {id}</p>
      <p>Anchor: left {frame.left}, top: {frame.top}</p>
      <p>Size: width {frame.width}, height: {frame.height}</p>
    </BoxColumn>
  </div>
}

export default function FramesView(props: FramesViewProps) {
  const [state, value] = useForest([stateFactory, props],
    (localState) => {
    });
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const {} = value;

  const frameStore = useMemo(() => dataState.child('frames'), [dataState]);
  console.log('frameStore:', frameStore);

  const frames = useForestFiltered(frameStore!, (frameMap) => {
    if (!frameMap) {
      return [];
    }
    return sortBy(c(frameMap).getReduce((list, frameRecord: StoreRecord<string, Frame>) => {
      if (frameRecord.content.project_id === props.projectId) {
        list.push(frameRecord.content)
      }
      return list;
    }, []), 'order');
  }, true);

  return (<>
    {frames.map((frame) => <Frame key={frame.id} frame={frame}/>)}
  </>);
}

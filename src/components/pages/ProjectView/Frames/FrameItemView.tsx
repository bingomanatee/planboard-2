import { useContext, useMemo, Suspense } from 'react'
import { numToPx } from '~/lib/utils'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import styles from '~/components/pages/ProjectView/Frames/FramesView.module.scss'
import { BoxColumn } from '~/components/BoxVariants'
import FrameContent from '~/components/pages/ProjectView/Frames/FrameContent/FrameContent'
import useForestFiltered from '~/lib/useForestFiltered'
import { c } from '@wonderlandlabs/collect'
import { Spinner } from 'grommet'
import dynamic from 'next/dynamic';

let ContentPrompt

export function FrameItemView({ id, frame, frameState }) {
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const { floatId } = useForestFiltered(frameState, ['floatId']);

  const style = useMemo(() => {
    return {
      left: numToPx(frame.left),
      top: numToPx(frame.top),
      width: numToPx(frame.width),
      height: numToPx(frame.height),
      zIndex: floatId === id ? 10000000 : ((frame.order || 0) * 100 + 1)
    }
  }, [frame, floatId])


  const content = useForestFiltered(dataState.child('content')!, (map) => {
    return c(map).getReduce((list, record) => {
      const { content } = record;
      if (content.frame_id === id) {
        list.push(content);
      }
      return list;
    }, []);
  });

  let inner = null;
  if (content.length) {
    inner = <FrameContent frame={frame} content={content[0]}/>
  } else {
    if (!ContentPrompt) {
      ContentPrompt = dynamic(() => import ( './ContentPrompt/ContentPrompt'), {
        suspense: true
      });
      console.log('ContentPrompt sent to ', ContentPrompt);
    }
    inner = <ContentPrompt frameState={frameState} frame={frame} frameId={id}/>
  }
  return <div className={styles.frame} style={style} id={`frame-${id}`}>
    <BoxColumn fill border={{ color: 'frame-border', size: '2px' }}>
      <Suspense fallback={<Spinner/>}>
        {inner}
      </Suspense>
    </BoxColumn>
  </div>
}

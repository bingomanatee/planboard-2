import { useContext, useMemo } from 'react'
import { numToPx } from '~/lib/utils'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import styles from '~/components/pages/ProjectView/Frames/FramesView.module.scss'
import { BoxColumn } from '~/components/BoxVariants'
import ContentPrompt from '~/components/pages/ProjectView/Frames/ContentPrompt/ContentPrompt'
import FrameContent from '~/components/pages/ProjectView/Frames/FrameContent/FrameContent'
import useForestFiltered from '~/lib/useForestFiltered'
import { c } from '@wonderlandlabs/collect'

export function FrameItemView({ id, frame, frameState }) {
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const {floatId} = useForestFiltered(frameState, ['floatId']);

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
      const {content} = record;
      if (content.frame_id === id) {
        list.push(content);
      }
      return list;
    }, []);
  });

  console.log('--------- content:', content, 'from', dataState.child('content')!.value);

  return <div className={styles.frame} style={style} id={`frame-${id}`}>
    <BoxColumn fill border={{ color: 'frame-border', size: '2px' }}>
      {!content.length ? <ContentPrompt frameState={frameState} frame={frame} frameId={id}/> :
        <FrameContent frame={frame} content={content}/>}
    </BoxColumn>
  </div>
}

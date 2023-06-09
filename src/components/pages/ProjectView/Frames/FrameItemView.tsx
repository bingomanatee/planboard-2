import { useContext, useMemo, Suspense, useEffect, useState } from 'react'
import { numToPx } from '~/lib/utils'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import styles from '~/components/pages/ProjectView/Frames/FramesView.module.scss'
import { BoxColumn } from '~/components/BoxVariants'
import FrameContent from '~/components/pages/ProjectView/Frames/FrameContent/FrameContent'
import useForestFiltered from '~/lib/useForestFiltered'
import { c } from '@wonderlandlabs/collect'
import { Spinner } from 'grommet'
import dynamic from 'next/dynamic';
import EditButton from '~/components/pages/ProjectView/EditButton/EditButton'
import MoveButton from '~/components/pages/ProjectView/MoveButton/MoveButton'
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'

let ContentPrompt

/**
 * this is the component that displays a SINGLE Frame.
 */
export function FrameItemView({ id, frameState }) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const { mouseMode } = useForestFiltered(projectState, ['mouseMode']);
  const { floatId } = useForestFiltered(frameState, ['floatId']);

  const [frameInfo, setFrameInfo] = useState({});

  useEffect(() => {
    if (!id) {
      return;
    }
    const sub = frameState.$.frameObserver(id).subscribe({
      next(value) {
        setFrameInfo(value);
      },
      error(err) {
        console.log('sub error for ', id, err);
      }
    });

    return () => {
      sub.unsubscribe()
    }
  }, [
    id, frameState
  ]);

  const [linking, setLinking] = useState(false);

  useEffect(() => {
    const eq = projectState.$.eq(window);
    if (!eq) {
        return;
    }
    const sub =  eq.keysObs.subscribe((keys) => {
      const isLinking = (keys.size == 1) && (keys.has('c'));
      setLinking(isLinking);
    });
    return () => sub.unsubscribe();
  }, [projectState, setLinking])

  const {content, frame} = (frameInfo  || {});

  const style = useMemo(() => {
    if (!frame) return {};
    return {
      left: numToPx(frame.left),
      top: numToPx(frame.top),
      width: numToPx(frame.width),
      height: numToPx(frame.height),
      zIndex: floatId === id ? 10000000 : ((frame.order || 0) * 100 + 1)
    }
  }, [frame, floatId, id])
  const { hover } = useForestFiltered(frameState, ['hover'])

  let inner = null;
  if (content) {
    inner = <FrameContent frame={frame} content={content}/>
  } else if (frame && !linking) {
    if (!ContentPrompt) {
      ContentPrompt = dynamic(() => import ( './ContentPrompt/ContentPrompt'), {
        suspense: true
      });
    }
    inner = <ContentPrompt frameState={frameState} frame={frame} frameId={id}/>
  }

  return <div className={styles.frame}
              style={style}
              data-frameid={id}
              id={`frame-${id}`} onMouseEnter={() => frameState.do.hover(id)}
              onMouseLeave={frameState.do.unHover}>
    <div className={styles.frameInner}>
      <BoxColumn fill border={{ color: (hover === id) ? 'frame-border-over' : 'frame-border', size: '2px' }}>
        <Suspense fallback={<Spinner/>}>
          <div className={styles['frame-clamp']}>
            {inner}
          </div>
        </Suspense>
      </BoxColumn>
      {(mouseMode || linking) ? null : (
        <>
          <EditButton type="frame"
                      active={hover === id}
                      onClick={ frameState.do.edit}
                      id={id}/>
          <MoveButton type="frame"
                      active={hover === id}
                      onClick={frameState.do.move}
                      id={id}
          />
        </>
      )}
    </div>
  </div>
}

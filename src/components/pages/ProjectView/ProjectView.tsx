import { memo, useContext, Suspense, useRef, createContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './ProjectView.module.scss';
import stateFactory, { ProjectViewValue } from './ProjectView.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import LoadStatePrompt from '~/components/pages/ProjectView/LoadStatePrompt/LoadStatePrompt'
import FramesView from '~/components/pages/ProjectView/Frames/FramesView'
import { Spinner } from 'grommet'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import MoveItem from '~/components/pages/ProjectView/MoveItem/MoveItem'
import SizeItem from '~/components/pages/ProjectView/SizeItem/SizeItem'
import { propsToPx } from '~/lib/utils'

let NewFrame = null;
type ProjectViewProps = { id: string }
export const ProjectViewStateContext = createContext(null);
export type ProjectViewStateContextProvider = typedLeaf<ProjectViewValue>;

export default memo(function ProjectView(props: ProjectViewProps) {
  const { dataState } = useContext(DataStateContext);

  const containerRef = useRef(null);

  const [value, state] = useForest<ProjectViewValue>([stateFactory, props, dataState, containerRef],
    (localState) => {
      localState.do.load();
      window.addEventListener('keydown', state.do.keyDown);
      window.addEventListener('keyup', state.do.keyUp);
      containerRef.current.addEventListener('mousedown', localState.do.mouseDown);
      return () => {
        console.log('--- ending listeners');
        window.removeEventListener('keydown', state.do.keyDown);
        window.removeEventListener('keyup', state.do.keyUp);
        containerRef.current?.removeEventListener('mousedown', localState.do.mouseDown);
      }
    });
  const { mouseMode, loadState, screenOffset, screenOffsetDelta, moveItem } = value;

  if (mouseMode === 'drawing-frame' && !NewFrame) {
    NewFrame = dynamic(() => import('./NewFrame/NewFrame'), { suspense: true })
  }
  const anchorStyle = useMemo(() => {
      if (!screenOffsetDelta) {
        return propsToPx({ left: screenOffset.x, top: screenOffset.y })
      }
      const dynOffset = screenOffset.clone().add(screenOffsetDelta);
      return propsToPx({ left: dynOffset.x, top: dynOffset.y })
    }
    , [screenOffset, screenOffsetDelta]);

  const showMove = !!((mouseMode === 'moving-item') && moveItem);
  console.log('showMove = ', showMove);

  return (
    <ProjectViewStateContext.Provider value={state}>
        <div className={styles.container} ref={containerRef}>
          <div className={styles.frameAnchor} style={anchorStyle}>
          {loadState === 'finished' || loadState === 'loaded' ? <FramesView projectId={props.id}/> : null}
          {mouseMode === 'drawing-frame' ? (
            <Suspense loading={<Spinner/>}>
              <NewFrame projectState={state}/>
            </Suspense>
          ) : null
          }
          {showMove ? <MoveItem projectState={state}/> : null}
          {showMove ? <SizeItem projectState={state}/> : null}
        </div>
          <LoadStatePrompt state={state}/>
        </div>
    </ProjectViewStateContext.Provider>
  );
});

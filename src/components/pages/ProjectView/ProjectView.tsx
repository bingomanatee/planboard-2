import { memo, useContext, Suspense, useRef, createContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './ProjectView.module.scss';
import stateFactory, { ProjectViewValue } from './ProjectView.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import LoadStatePrompt from '~/components/pages/ProjectView/LoadStatePrompt/LoadStatePrompt'
import FramesView from '~/components/pages/ProjectView/Frames/FramesView'
import { Spinner } from 'grommet'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import MoveItem from '~/components/pages/ProjectView/MoveItem/MoveItem'
import SizeItem from '~/components/pages/ProjectView/SizeItem/SizeItem'
import { propsToPx } from '~/lib/utils'
import ErrorTrapper from '~/components/ErrorTrapper'
import ProjectGrid from '~/components/pages/ProjectView/ProjectGrid/ProjectGrid'

let NewFrame = null;
type ProjectViewProps = { id: string }
export const ProjectViewStateContext = createContext(null);
export type ProjectViewStateContextProvider = typedLeaf<ProjectViewValue>;

let ProjectEdit;
/* this is the root view editing a project
 */
export default memo(function ProjectView(props: ProjectViewProps) {
  const { dataState } = useContext(DataStateContext);
  const { globalState } = useContext(GlobalStateContext);

  const containerRef = useRef(null);

  const [value, state] = useForest<ProjectViewValue>([stateFactory, props, dataState, globalState, containerRef],
    (localState) => {
      localState.do.load().then(() => {
        window.addEventListener('keydown', state.do.keyDown);
        window.addEventListener('keyup', state.do.keyUp);
        containerRef.current.addEventListener('mousedown', localState.do.mouseDown);
        localState.do.initNavMenu();
      });
      return () => {
        console.log('--- ending listeners');
        window.removeEventListener('keydown', state.do.keyDown);
        window.removeEventListener('keyup', state.do.keyUp);
        containerRef.current?.removeEventListener('mousedown', localState.do.mouseDown);
      }
    });
  const { mouseMode, loadState, screenOffset, screenOffsetDelta, moveItem, editMode } = value;

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

  if (editMode && !ProjectEdit) {
    ProjectEdit = dynamic(() => import ('~/components/pages/ProjectView/ProjectEdit/ProjectEdit'),
      { suspense: true }
    )
  }

  return (
    <ProjectViewStateContext.Provider value={state}>
        <div className={styles.container} ref={containerRef}>
          <div className={styles.frameAnchor} style={anchorStyle}>
            {loadState === 'finished' || loadState === 'loaded' ? <ProjectGrid /> : null}
          {loadState === 'finished' || loadState === 'loaded' ? <FramesView projectId={props.id}/> : null}
          {mouseMode === 'drawing-frame' ? (
            <Suspense loading={<Spinner/>}>
              <NewFrame projectState={state}/>
            </Suspense>
          ) : null
          }
          {showMove ? <MoveItem projectState={state}/> : null}
          {showMove ? <SizeItem projectState={state}/> : null}
            <ErrorTrapper boundry={"editItem"}>
              {editMode ? (
                <Suspense fallback={<Spinner/>}>
                  <ProjectEdit closeTrigger={() => state.do.closeEdit()} editMode={editMode} />
                </Suspense>
              ) : null}
            </ErrorTrapper>
        </div>
          {loadState === 'finished' || loadState === 'loaded' ?<LoadStatePrompt state={state}/> : null}
        </div>
    </ProjectViewStateContext.Provider>
  );
});

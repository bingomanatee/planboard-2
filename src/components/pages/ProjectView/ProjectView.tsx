import { memo, useContext, Suspense, useRef, createContext } from 'react';
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
  const { projectMode, loadState, loadError, moveItem } = value;

  if (projectMode === 'drawing-frame' && !NewFrame) {
    NewFrame = dynamic(() => import('./NewFrame/NewFrame'), { suspense: true })
  }

  console.log('project state:', projectMode, 'moveItem', moveItem);
  return (
    <ProjectViewStateContext.Provider value={state}>
      <div className={styles.container} ref={containerRef}>
        {loadState === 'finished' || loadState === 'loaded' ? <FramesView projectId={props.id}/> : null}
        {projectMode === 'drawing-frame' ? (
          <Suspense loading={<Spinner/>}>
            <NewFrame projectState={state}/>
          </Suspense>
        ) : null
        }
        { projectMode === 'moving-item' && moveItem? <MoveItem projectState={state} /> : null}
        { projectMode === 'moving-item' && moveItem? <SizeItem projectState={state} /> : null}
        <LoadStatePrompt state={state}/>
      </div>
    </ProjectViewStateContext.Provider>
  );
});

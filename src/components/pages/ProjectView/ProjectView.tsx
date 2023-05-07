import { memo, useContext, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './ProjectView.module.scss';
import stateFactory, { ProjectViewValue } from './ProjectView.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import LoadStatePrompt from '~/components/pages/ProjectView/LoadStatePrompt/LoadStatePrompt'
import FramesView from '~/components/pages/ProjectView/Frames/FramesView'
import { Spinner } from 'grommet'

let NewFrame = null;
type ProjectViewProps = { id: string }

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
  const { projectState, loadState, loadError } = value;

  if (projectState === 'drawing-frame' && !NewFrame) {
    NewFrame = dynamic(() => import('./NewFrame/NewFrame'), { suspense: true })
  }

  console.log('loadState', loadState, loadError);
  return (<div className={styles.container} ref={containerRef}>
    {loadState === 'finished' ? <FramesView projectId={props.id}/> : null}
    {projectState === 'drawing-frame' ? (
      <Suspense loading={<Spinner/>}>
        <NewFrame projectState={state}/>
      </Suspense>
    ) : null
    }
    <LoadStatePrompt state={state}/>
  </div>);
});

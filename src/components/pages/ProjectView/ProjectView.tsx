import { useState, useEffect, useContext, createRef, useRef } from 'react';
import { Text, Box } from 'grommet';
import styles from './ProjectView.module.scss';
import stateFactory, { ProjectViewValue } from './ProjectView.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import LoadStatePrompt from '~/components/pages/ProjectView/LoadStatePrompt/LoadStatePrompt'
import NewFrame from '~/components/pages/ProjectView/NewFrame/NewFrame'
import FramesView from '~/components/pages/ProjectView/Frames/FramesView'

type ProjectViewProps = { id: string }

export default function ProjectView(props: ProjectViewProps) {
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
        containerRef.current.removeEventListener('mousedown', localState.do.mouseDown);
      }
    });

  const { projectState, loadState } = value;
  console.log('loadState', loadState);
  return (<div className={styles.container} ref={containerRef}>
    {loadState === 'finished'? <FramesView projectId={props.id} /> : null}
    {projectState === 'drawing-frame' ? <NewFrame projectState={state}/> : null}
    <LoadStatePrompt state={state}/>
  </div>);
}

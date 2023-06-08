import { createContext, memo, Suspense, useCallback, useContext, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './ProjectView.module.scss';
import stateFactory, { MODE_ADD_FRAME, ProjectViewValue } from './ProjectView.state.ts';
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

  const onCreate = useCallback((localState) => {
    localState.do.initNavMenu();
    localState.do.load(props.id);
    localState.do.initEvents(window);
    return localState.$.clearSubs;
  }, [props.id])

  const [value, state] = useForest<ProjectViewValue>([stateFactory, props.id, dataState, globalState, containerRef],
    onCreate);
  const { mouseMode, loadState, screenOffset, screenOffsetDelta, moveItem, editMode, editItem, } = value;

  if (mouseMode === MODE_ADD_FRAME && !NewFrame) {
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

  if ((editMode || editItem) && !ProjectEdit) {
    ProjectEdit = dynamic(() => import ('~/components/pages/ProjectView/ProjectEdit/ProjectEdit'),
      { suspense: true }
    )
  }

  const ready = loadState === 'finished' || loadState === 'loaded';
  return (
    <ProjectViewStateContext.Provider value={state}>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.frameAnchor} style={anchorStyle}>
          {ready ? (
            <>
              <ProjectGrid/>
              <FramesView projectId={props.id}/>
              {mouseMode === MODE_ADD_FRAME ? (
                <Suspense loading={<Spinner/>}>
                  <NewFrame projectState={state}/>
                </Suspense>
              ) : null
              }
              {showMove ? <MoveItem projectState={state}/> : null}
              {showMove ? <SizeItem projectState={state}/> : null}
              <ErrorTrapper boundry={"ProjectEdit"}>
                {editMode || editItem ? (
                  <Suspense fallback={<Spinner/>}>
                    <ProjectEdit closeTrigger={() => state.do.closeEdit()} editMode={editMode} editItem={editItem} />
                  </Suspense>
                ) : null}
              </ErrorTrapper>
            </>
          ) : null}

        </div>
        {ready ? <LoadStatePrompt state={state}/> : null}
      </div>
    </ProjectViewStateContext.Provider>
  );
});

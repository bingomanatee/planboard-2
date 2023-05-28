import { useContext, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic'
import { c } from '@wonderlandlabs/collect'
import { Spinner } from 'grommet'
import { sortBy } from 'lodash'

import useForestFiltered from '~/lib/useForestFiltered'
import { StoreRecord } from '~/lib/store/types'
import useForest from '~/lib/useForest';

import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import { FrameItemView } from '~/components/pages/ProjectView/Frames/FrameItemView'
import ErrorTrapper from '~/components/ErrorTrapper'

import stateFactory from './FramesView.state.ts';
import { MODE_ADD_LINK } from '~/components/pages/ProjectView/ProjectView.state'
import DrawLink from '~/components/pages/ProjectView/Frames/DrawLink/DrawLink'
import FrameLinks from '~/components/pages/ProjectView/Frames/FrameLinks/FrameLinks'

let ProjectEdit;
type FramesViewProps = {
  projectId: string
}

export default function FramesView(props: FramesViewProps) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const [value, state] = useForest([stateFactory, props, projectState, dataState],
    (_localState) => {
    });
  const {
    editItem,
  } = value;

  const {
    linkStartId, linkEndId, mouseMode
  } = useForestFiltered(projectState, ['mouseMode', 'linkStartId', 'linkEndId'])

  const frameStore = useMemo(() => dataState.child('frames'), [dataState]);
  const frames = useForestFiltered(frameStore!, (frameMap) => {
    if (!frameMap) {
      return [];
    }
    return sortBy(c(frameMap).getReduce((list, frameRecord: StoreRecord<string, FrameItemView>) => {
      if (frameRecord.content.project_id === props.projectId) {
        list.push(frameRecord.content)
      }
      return list;
    }, []), 'order');
  }, true);

  if (editItem && !ProjectEdit) {
    ProjectEdit = dynamic(() => import ('~/components/pages/ProjectView/ProjectEdit/ProjectEdit'),
      { suspense: true }
    )
  }

  if (mouseMode && linkEndId) {
    console.log(' ---- frameView project state:', linkStartId, linkEndId, mouseMode);
  }

  // todo: move into Project View
  return (<>
    <FrameLinks />
    {frames.map((frame) => {
      return <FrameItemView key={frame.id} frameState={state} id={frame.id} frame={frame}/>
    })}
    {(mouseMode === MODE_ADD_LINK) ? <DrawLink frameState={state}
                linkStartId={linkStartId}
                linkEndId={linkEndId}
      /> : null}
    <ErrorTrapper boundry={"editItem"}>
      {editItem ? (
        <Suspense fallback={<Spinner/>}>
          <ProjectEdit closeTrigger={() => state.do.closeEdit()} editItem={editItem}/>
        </Suspense>
      ) : null}
    </ErrorTrapper>
  </>);
}

/**
 *     {((mouseMode === MODE_ADD_LINK) && (linkStartId && linkEndId)) ? (
 *       <DrawLink frameState={state}
 *                 linkStartId={linkStartId}
 *                 linkEndId={linkEndId}
 *       />
 *     ) : null}
 */

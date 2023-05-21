import { useContext, useMemo, Suspense, useEffect } from 'react';
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

import styles from './FramesView.module.scss'
import stateFactory from './FramesView.state.ts';
import { propsToPx } from '~/lib/utils'

let ProjectEdit;
type FramesViewProps = {
  projectId: string
}

export default function FramesView(props: FramesViewProps) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const [value, state] = useForest([stateFactory, props, projectState],
    (localState) => {
    });
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const { editItem } = value;

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

  // todo: move into Project View
  return (<>
    {frames.map((frame) => {
      return <FrameItemView key={frame.id} frameState={state} id={frame.id} frame={frame}/>
    })}
    <ErrorTrapper boundry={"editItem"}>
      {editItem ? (
        <Suspense fallback={<Spinner/>}>
          <ProjectEdit closeTrigger={() => state.do.closeEdit()} editItem={editItem}/>
        </Suspense>
      ) : null}
    </ErrorTrapper>
  </>);
}

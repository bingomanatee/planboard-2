import { useContext, useMemo, Suspense, useEffect } from 'react';
import stateFactory from './FramesView.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import useForestFiltered from '~/lib/useForestFiltered'
import { c } from '@wonderlandlabs/collect'
import { StoreRecord } from '~/lib/store/types'
import { sortBy } from 'lodash'
import { FrameItemView } from '~/components/pages/ProjectView/Frames/FrameItemView'
import { Spinner } from 'grommet'
import dynamic from 'next/dynamic'
import ErrorTrapper from '~/components/ErrorTrapper'

let ProjectEdit;
type FramesViewProps = {
  projectId: string
}

export default function FramesView(props: FramesViewProps) {
  const [value, state] = useForest([stateFactory, props],
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
    {frames.map((frame) => <FrameItemView key={frame.id} frameState={state} id={frame.id} frame={frame}/>)}
    <ErrorTrapper boundry={"editItem"}>
      {editItem ? (
        <Suspense fallback={<Spinner/>}>
          <ProjectEdit onCancel={() => state.do.cancelEdit()} editItem={editItem}/>
        </Suspense>
      ) : null}
    </ErrorTrapper>
  </>);
}

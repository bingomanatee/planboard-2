import { useContext } from 'react';
import styles from './ProjectGrid.module.scss';
import stateFactory from './ProjectGrid.state.ts';
import useForest from '~/lib/useForest';
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import DrawGrid from '~/components/DrawGrid/DrawGrid'

type ProjectGridProps = {}

export default function ProjectGrid(props: ProjectGridProps) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const [value, state] = useForest([stateFactory, props, dataState, projectState.value.projectId],
    (localState) => {
      const sub = dataState.child('settings')!
        .$.watchQuery(
          (record) => {
            return localState.do.loadSetting(record?.content)
          },
          [{ field: 'name', value: 'grid' }],
          true
        );
      return () => sub.unsubscribe();
    });

  const {} = value;

  return (<div className={styles.container}>
    <DrawGrid {...value} />
  </div>);
}

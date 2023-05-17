import { useState, useEffect, useContext } from 'react';
import { Text, Box } from 'grommet';
import styles from './ProjectGrid.module.scss';
import stateFactory from './ProjectGrid.state.ts';
import useForest from '~/lib/useForest';
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { Setting } from '~/types'
import DrawGrid from '~/components/DrawGrid/DrawGrid'

type ProjectGridProps = {}

export default function ProjectGrid(props: ProjectGridProps) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const [value, state] = useForest([stateFactory, props, dataState, projectState.value.projectId],
    (localState) => {
      const settings = dataState.child('settings')!;
      const sub = settings.select((gridSetting?: Setting) => {
        try {
          localState.do.loadSetting(gridSetting);
        } catch (e) {
          console.log('PGSE : ', e);
        }
      }, () => {
        // every time the settings change, find the grid settings.
        //@TODO: leverage RxJS more efficiently
        try {
          const [gridSetting] = settings.do.find([
            { field: 'project_id', value: projectState.value.projectId },
            { field: 'name', value: 'grid' }
          ]);
          return gridSetting?.content || null;
        } catch (error) {
          console.log('ProjectGrid state error: ', error);
        }
        return null;
      });

      return sub.unsubscribe();
    });

  const {} = value;

  return (<div className={styles.container}>
      <DrawGrid {...value} />
  </div>);
}

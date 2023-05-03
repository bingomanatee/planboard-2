import { BoxColumn } from '~/components/BoxVariants'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import { useContext, useEffect, useState } from 'react'
import styles from './ListProjects.module.scss';
import NoData from '~/components/NoData'
import { c } from '@wonderlandlabs/collect'
import { NameId } from '~/types'
import { Text } from 'grommet'
import Img from '~/components/Img'

function ProjectItem(props: { project: NameId }) {
  console.log('props:', props);
  const {name, id}= props.project;
  console.log('id/name:', id, name)
  return <div className={styles.item}>
    <div className={styles.id}><Text size={'xxsmall'}>{id}</Text></div>
    <div className={styles.name}><Text weight="bold">{name}</Text></div>
    <div className={styles.action}><Img src="/img/icons/list-go-arrow.svg" /></div>
  </div>
}

const ListProjects = () => {
  const { dataState, dataValue } = useContext(DataStateContext)
  const user = dataValue.get('user');
  const [projects, setProjects] = useState(new Map())
  const projectStore = dataState.child('projects')!;

  useEffect(() => {
    projectStore.do.loadProjects();
    const sub = projectStore.subscribe(setProjects);
    return () => sub.unsubscribe();
  }, [projectStore, user]);

  return projects.size ? <BoxColumn gap="xsmall">
      {
        c(projects).getReduce((list, project) => {
          list.push (<ProjectItem project={project.content} key={project.id}/>);
          return list;
        }, [])
      }
    </BoxColumn> :
    <NoData>No Projects Saved</NoData>
}

export default ListProjects

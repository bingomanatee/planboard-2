import { BoxColumn } from '~/components/BoxVariants'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import { useCallback, useContext, useEffect, useState } from 'react'
import styles from './ListProjects.module.scss';
import NoData from '~/components/NoData'
import { c } from '@wonderlandlabs/collect'
import { NameId } from '~/types'
import { Text } from 'grommet'
import Img from '~/components/Img'
import { Router, useRouter } from 'next/router'

function ProjectItem(props: { project: NameId, router: Router }) {
  console.log('props:', props);
  const { name, id } = props.project;
  const go = useCallback(() => {
    props.router.push('/project/' + id);
  }, [props.router, id]);
  return <div className={styles.item} onClick={go}>
    <div className={styles.id}><Text size={'xxsmall'}>{id}</Text></div>
    <div className={styles.name}><Text weight="bold">{name}</Text></div>
    <div className={styles.action}><Img src="/img/icons/list-go-arrow.svg"/></div>
  </div>
}

const ListProjects = () => {
  const { dataState, dataValue } = useContext(DataStateContext)
  const user = dataValue.get('user');
  const [projects, setProjects] = useState(new Map())
  const projectStore = dataState.child('projects')!;
  const router = useRouter();

  useEffect(() => {
    projectStore.do.loadProjects();
    const sub = projectStore.subscribe(setProjects);
    return () => sub.unsubscribe();
  }, [projectStore, user]);

  return projects.size ? <BoxColumn gap="xsmall">
      {
        c(projects).getReduce((list, project) => {
          list.push(<ProjectItem project={project.content} router={router} key={project.id}/>);
          return list;
        }, [])
      }
    </BoxColumn> :
    <NoData>No Projects Saved</NoData>
}

export default ListProjects

import { BoxColumn } from '~/components/BoxVariants'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import { useContext, useEffect, useState } from 'react'
import DashboardList from '~/components/DashboardList/DashboardList'
import NoData from '~/components/DashboardList/NoData'

const ListProjects = () => {
  const { dataState, dataValue } = useContext(DataStateContext)

  const [projects, setProjects] = useState(new Map())
  const projectStore = dataState.child('projects')!;

  useEffect(() => {
    projectStore.do.loadProjects();
    const sub = projectStore.subscribe(setProjects);
    return () => sub.unsubscribe();
  }, [projectStore]);

  return projects.size ? <DashboardList data={Array.from(projects.values()).map((p) => p.content)}/> :
    <NoData>No Projects Saved</NoData>
}

export default ListProjects

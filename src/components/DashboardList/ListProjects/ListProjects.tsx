import { BoxColumn } from '~/components/BoxVariants'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import { useContext, useEffect, useState } from 'react'
import DashboardList from '~/components/DashboardList/DashboardList'
import NoData from '~/components/DashboardList/NoData'

const ListProjets = () => {
   const { globalValue} = useContext(GlobalStateContext)
  const {dataState} = useContext(DataStateContext)

  const {user} = globalValue;
   const [projects, setProjects] = useState([])

   useEffect(() => {
     dataState.do.loadProjectsFor(user?.id || '');
     const sub = dataState.child('projects')!.subscribe(setProjects);
     return () => sub.unsubscribe();
   }, [user]);

  return projects.length ? <DashboardList data={projects} /> : <NoData>No Projects Saved</NoData>
}

export default ListProjets

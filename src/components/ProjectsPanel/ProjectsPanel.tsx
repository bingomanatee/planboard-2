import { NewButton } from '~/components/NewButton/NewButton'
import ListProjects from '~/components/ProjectsPanel/ListProjects/ListProjects'
import DashboardCard from '~/components/DashboardCard/DashboardCard'
import { useContext, useState } from 'react'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import Popup from '~/components/Popup/Popup'
import { CreateProjectModal } from '~/components/ProjectsPanel/CreateProjectModal'

export default function ProjectsPanel({}) {
  const { dataState } = useContext(DataStateContext);
  const [createProject, setCreateProject] = useState(false);

  return (
    <>
      <DashboardCard label={"projects"} headContent={
        [<NewButton key="btn" icon="/img/icons/dp-new-project.svg" onClick={() => setCreateProject(true)}>
          New Project</NewButton>]
      }>
        <ListProjects />
      </DashboardCard>
      <Popup closed={!createProject} observer={setCreateProject}>
        <CreateProjectModal createProject={createProject} complete={() => setCreateProject(false)}/>
      </Popup>
    </>
  )
}

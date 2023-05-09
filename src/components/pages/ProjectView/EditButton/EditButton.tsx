import styles from './EditButton.module.scss';
import Img from '~/components/Img'
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import { useContext } from 'react'
import { EditItem } from '~/components/pages/ProjectView/ProjectView.state'

type EditButtonProps = {type: string, id:string, onClick: (item: EditItem) => null}

export default function EditButton(props: EditButtonProps) {
  const projectViewState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  return (<div className={styles.container}
               onClick={() => props.onClick({type: props.type, id: props.id})}
  >
    <Img src="/img/icons/edit-icon.svg" width={25} height={25}/>
  </div>);
}

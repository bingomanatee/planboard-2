import styles from './EditButton.module.scss';
import Img from '~/components/Img'
import { TargetData } from '~/components/pages/ProjectView/ProjectView.state'
import EditIcon from '~/components/svg/EditIcon'

type EditButtonProps = {type: string, id:string, onClick: (item: TargetData) => null, active}

export default function EditButton(props: EditButtonProps) {
  return (<div className={styles.container}
               style={{color: props.active ? 'rgb(0, 10, 102)' : 'rgba(0,10,102,0.2)'}}
               onClick={() => props.onClick({type: props.type, id: props.id})}
  >
    <EditIcon width={25} height={25}/>
  </div>);
}

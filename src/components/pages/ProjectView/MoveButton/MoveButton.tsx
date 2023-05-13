import styles from './MoveButton.module.scss';
import { TargetData } from '~/components/pages/ProjectView/ProjectView.state'
import MoveIcon from '~/components/svg/MoveIcon'

type EditButtonProps = {type: string, id:string, onClick: (item: TargetData) => null, active}

export default function MoveButton(props: EditButtonProps) {
  return (<div className={styles.container}
               data-mouse-responder="responder"
               style={{color: props.active ? 'rgb(100, 0, 105)' : 'rgba(100,0, 105,0.2)'}}
               onClick={() => props.onClick({type: props.type, id: props.id})}
  ><MoveIcon width="20px" height="20px" /></div>);
}

import { CardHeader } from 'grommet'
import styles from './Popup.module.scss';

const pad = { horizontal: 'small', vertical: 'xsmall' };

export default function PopupCardHeader({ children }) {
  return <CardHeader pad={pad} background="card-header" justify="stretch" className={styles.header}>
    {children}
  </CardHeader>
}

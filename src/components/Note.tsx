import {Text} from 'grommet';
import styles from './shared.module.scss';
export default function Note({children}) {
  return <div data-role="note" className={styles.note}>
    <Text size="xsmall">{children}</Text>
  </div>
}

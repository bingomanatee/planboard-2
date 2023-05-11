import {Text} from 'grommet';
import styles from './shared.module.scss';

export default function Info({children}) {
  return <div data-role="info" className={styles.info}>
    <Text size="xsmall">{children}</Text>
  </div>
}

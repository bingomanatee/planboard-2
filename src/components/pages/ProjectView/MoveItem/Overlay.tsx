import { leafI } from '@wonderlandlabs/forest/lib/types'
import styles from '~/components/pages/ProjectView/MoveItem/MoveItem.module.scss'

/**
 * the orange bordered empty rect that shows where the frame will be as you move it
 */
export function Overlay({ state }: { state: leafI }) {
  return <div className={styles.overlay} style={state.$.overlayStyle()}/>
}

import { leafI } from '@wonderlandlabs/forest/lib/types'
import styles from '~/components/pages/ProjectView/MoveItem/MoveItem.module.scss'
import Img from '~/components/Img'

/**
 * the button that triggers a mouse movement
 */
export function MoveWidget({ state }: { state: leafI }) {
  return <div className={styles['move-widget-icon-container']}
              data-role="move-widget-icon-container"
              style={state.$.moveWidgetStyle()}
              data-mouse-responder="responder"
              onMouseDown={(e) => {
                state.do.startMoveDrag(e);
              }}
  >
    <Img src="/img/icons/widget-move.svg"
         data-role="widget-move-icon" width={30} height={30}/>
  </div>
}

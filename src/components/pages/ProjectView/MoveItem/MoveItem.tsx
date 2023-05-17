import styles from './MoveItem.module.scss';
import stateFactory from './MoveItem.state.ts';
import useForest from '~/lib/useForest';
import { MoveItemProps } from '~/components/pages/ProjectView/MoveItem/types'
import { useContext, useRef } from 'react'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import Img from '~/components/Img'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Stack } from 'grommet'

function MoveWidget({ state }: { state: leafI }) {
  return <div className={styles['move-widget-icon-container']}
              data-role="move-widget-icon-container"
              style={state.$.moveWidgetStyle()}

  >
    <Img src="/img/icons/widget-move.svg"
         data-role="widget-move-icon" width={30} height={30}/>
    <div className={styles['mouse-overlay']}
         data-mouse-responder="responder"
         onMouseDown={(e) => {
           state.do.startMoveDrag(e);
         }}>
    </div>
  </div>
}

function Overlay({ state }: { state: leafI }) {
  return <div className={styles.overlay} style={state.$.overlayStyle()}/>
}

export default function MoveItem(props: MoveItemProps) {
  const containerRef = useRef(null);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      localState.do.init(containerRef);
    });

  const { movePosCurrent, movePosStart } = value;

  return (<div className={styles.container} ref={containerRef}>
    <div className={styles['move-widget']}>
      <MoveWidget state={state}/>
      {movePosCurrent ? <Overlay state={state}/> : null}
    </div>
  </div>);
}

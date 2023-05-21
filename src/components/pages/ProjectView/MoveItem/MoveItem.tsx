import styles from './MoveItem.module.scss';
import stateFactory from './MoveItem.state.ts';
import useForest from '~/lib/useForest';
import { MoveItemProps } from '~/components/pages/ProjectView/MoveItem/types'
import { useContext, useRef } from 'react'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { MoveWidget } from '~/components/pages/ProjectView/MoveItem/MoveWidget'
import { Overlay } from '~/components/pages/ProjectView/MoveItem/Overlay'

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

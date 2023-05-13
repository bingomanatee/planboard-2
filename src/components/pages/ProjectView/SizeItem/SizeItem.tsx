import styles from './SizeItem.module.scss';
import stateFactory from './SizeItem.state';
import useForest from '~/lib/useForest';
import { MoveItemProps } from '~/components/pages/ProjectView/MoveItem/types'
import { useContext, useMemo, useRef } from 'react'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import Img from '~/components/Img'
import { leafI } from '@wonderlandlabs/forest/lib/types'

function SizeWidget({ state }: { state: leafI }) {

  const style = useMemo(() => {
    return state.$.sizeWidgetStyle()
  }, [state.value.position.left, state.value.position.top, state.value.position.width, state.value.position.height]);
  return <div className={styles['size-widget-icon-container']}
              data-role="size-widget-icon-container"
              style={style}
              onMouseDown={(e) => {
                state.do.startSizeDrag(e);
              }}
  >
    <Img src="/img/icons/widget-size.svg"
         data-mouse-responder="responder"
         width={30}
         height={30}/>
  </div>
}

function Overlay({ state }: { state: leafI }) {
  return <div className={styles.overlay} style={state.$.overlayStyle()}/>
}

export default function SizeItem(props: MoveItemProps) {
  const containerRef = useRef(null);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      localState.do.init(containerRef);
    });

  const { sizePosCurrent } = value;

  return (<div className={styles.container} ref={containerRef}>
    <div className={styles['size-widget']}>
      <SizeWidget state={state}/>
      {sizePosCurrent ? <Overlay state={state}/> : null}
    </div>
  </div>);
}

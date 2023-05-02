import { createContext, useEffect } from 'react'
import useForest from '~/lib/useForest'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Layer } from 'grommet'
import styles from './Popup.module.scss';
import { GenericProps } from '~/types'
import MouseActionTerminator from '~/components/MouseActionTerminator'

export const PopupContext = createContext(null);
type obsTrigger = (closeState) => void;

export default function Popup(props: {closed?: boolean, observer?: obsTrigger} & GenericProps) {

  const [value, state] = useForest([() => ({
    $value: {
      closed: !!props.closed
    },
    actions: {
      hideModal: (leaf: leafI) => {
        leaf.do.set_closed(true);
        if (typeof props.observer === 'function') {
          props.observer(false);
        }
      }
    }
  })]);

  useEffect(() => {
    state.do.set_closed(!!props.closed);
  }, [props.closed, state])

  if (value.closed) {
    return null;
  }

  return (
    <Layer plain full animate={false}>
      <div className={styles.cover} onClick={() => state.do.hideModal()}>
        <PopupContext.Provider value={{ popupState: state }}>
          <MouseActionTerminator>
          {props.children}
          </MouseActionTerminator>
        </PopupContext.Provider>
      </div>
    </Layer>
  )
}

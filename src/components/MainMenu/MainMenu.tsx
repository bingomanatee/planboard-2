import {  useContext, memo } from 'react';
import {  Button, Menu } from 'grommet';
import styles from './MainMenu.module.scss';
/*import stateFactory from './MainMenu.state.ts';
import useForest from '~/lib/useForest';*/
import { BoxColumn } from '~/components/BoxVariants'
import { GlobalStateContext } from '~/components/GlobalState/GlobalState'
import asText from '~/components/utils/asText'
import useForestFiltered from '~/lib/useForestFiltered'
import { GlobalProvided } from '~/components/GlobalState/types'
import { triggerFn } from '~/types'

type MainMenuProps = { closeDropMenu: triggerFn }

function MainMenu(props: MainMenuProps) {
  const { globalState } = useContext<GlobalProvided>(GlobalStateContext);
/*  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });
  const {} = value;*/

  const { menuItems } = useForestFiltered(globalState, ['menuItems'])
  return (<BoxColumn gap="small" width="200px" className={styles.container}>
    {
      menuItems.map((item, i) => {
        const onClick = (e) => {
          props.closeDropMenu();
          if (typeof item.props?.onClick === 'function') {
            item.props.onClick(e);
          }
          e.stopPropagation();
        }
        switch (item.type) {
          case 'button':
            return <Button className={styles.menuButton}
                           key={'menu-item-' + i}
                           focusIndicator={false}
                           {...item.props}
                           onClick={onClick}
            >{asText(item.label, { size: 'medium' }
            )}</Button>
            break;
          case 'menu':
            return <Menu {...item.props} />
            break;
          default:
            return item;
        }
      })
    }
  </BoxColumn>);
}

export default memo(MainMenu)

import { DropButton, Heading, Nav } from 'grommet'
import Img from '~/components/Img'
import style from './Navigation.module.scss'
import UserMenuItem from '~/components/Navigation/UserMenuItem'
import Link from 'next/link'
import { BoxColumn } from '~/components/BoxVariants'
import { useCallback, useContext } from 'react'
import { GlobalStateContext } from '~/components/GlobalState/GlobalState'
import MainMenu from '~/components/MainMenu/MainMenu'
import { clickOnId } from '~/lib/utils'

const NAV_DROP_BUTTON_TARGET = "nav-drop-button-target";
export default function Navigation() {

  const closeDropMenu = useCallback(() => {
    clickOnId(NAV_DROP_BUTTON_TARGET);
  }, [])

  return <Nav background="nav-background"
              align="center"
              pad={{ horizontal: 'small' }}
              style={{ zIndex: 20000000 }}
              justify="between"
              direction="row" className={style.nav}>
    <DropButton
      dropAlign={{left: 'left', top: 'bottom'}}
      label={<BoxColumn id={NAV_DROP_BUTTON_TARGET} width="15px"><Img src="/img/icons/menu-anchor.svg"/></BoxColumn>}
      dropContent={
        <MainMenu closeDropMenu={closeDropMenu} />
      }/>
    <Link href="/">
      <Heading level={1}>Planboard</Heading>
    </Link>
    <UserMenuItem/>
  </Nav>

}

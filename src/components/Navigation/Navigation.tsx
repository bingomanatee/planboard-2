import { Heading, Nav } from 'grommet'
import Img from '~/components/Img'
import style from './Navigation.module.scss'
import UserMenuItem from '~/components/Navigation/UserMenuItem'
import Link from 'next/link'

export default function Navigation() {

  return <Nav background="nav-background"
              align="center"
              pad={{ horizontal: 'small' }}

              direction="row" className={style.nav}>
    <Link href="/"><Img src="/img/icons/menu-anchor.svg"/></Link>
    <Heading level={1}>Planboard</Heading>
    <UserMenuItem />
  </Nav>

}
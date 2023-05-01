import Img from '~/components/Img'
import { Auth } from '@supabase/auth-ui-react'
import useUser = Auth.useUser
import Link from 'next/link'
import { Menu } from 'grommet'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useContext } from 'react'
import { GlobalStateContext } from '~/components/GlobalState/GlobalState'


export default function UserMenuItem() {
  const { globalValue, globalState } = useContext(GlobalStateContext);
  const {user} = globalValue;

  if (user) {
    return <Menu
      dropAlign={{
        top: 'bottom',
        right: 'right'
      }}
      icon={<Img
        src={`/img/icons/nav-user.svg`}/>}
      items={[
        { label: 'Sign Out', onClick: () => {
            globalState.getMeta('supabaseClient')!.auth.signOut();
          }}
      ]}
    />
  }
  return <Link href={user ? '/logout' : "/login"}><Img
    src={`/img/icons/nav-user-inactive.svg`}/></Link>
}

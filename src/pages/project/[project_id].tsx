import { Inter } from 'next/font/google'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useContext, useEffect } from 'react'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import { Spinner } from 'grommet'
import ProjectView from '~/components/pages/ProjectView/ProjectView'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Project(arg) {
  const supabaseClient = useSupabaseClient()
  const router = useRouter();
  const user = useUser()
  const { globalState } = useContext(GlobalStateContext);
  const { dataState } = useContext(DataStateContext);
  useEffect(() => {
    globalState.do.set_user(user);
    dataState.do.set_user(user);
    globalState.setMeta('supabaseClient', supabaseClient, true);
  }, [user, globalState])

  if (!router?.query?.project_id) {
    return <Spinner size="large" />
  }
  return (
    <ProjectView id={router.query.project_id} />
  )
}

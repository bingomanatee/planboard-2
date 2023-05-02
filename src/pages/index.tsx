import { Inter } from 'next/font/google'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useContext, useEffect } from 'react'
import { DataStateContext, GlobalStateContext } from '~/components/GlobalState/GlobalState'
import { Box, Heading } from 'grommet'
import ListProjects from '~/components/ProjectsPanel/ListProjects/ListProjects'
import { NewButton } from '~/components/NewButton/NewButton'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import DashboardCard from '~/components/DashboardCard/DashboardCard'
import ProjectsPanel from '~/components/ProjectsPanel/ProjectsPanel'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const { globalState } = useContext(GlobalStateContext);
  const { dataState } = useContext(DataStateContext);
  useEffect(() => {
    globalState.do.set_user(user);
    dataState.do.set_user(user);
    globalState.setMeta('supabaseClient', supabaseClient, true);
  }, [user, globalState])

  return (
    <BoxRow pad="large" justify="start" align="start">
      <Box width="50%">
        <ProjectsPanel />
      </Box>
    </BoxRow>
  )
}

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import React, { useContext, useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import { useRouter } from 'next/router'
import { GlobalStateContext } from '~/components/GlobalState/GlobalState'

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser();
  const router = useRouter();

  // may not be necessary - no state management on this page
  const { globalState } = useContext(GlobalStateContext);
  useEffect(() => {
    globalState.do.set_user(user);
    globalState.setMeta('supabaseClient', supabaseClient, true);
  }, [user, globalState])

  useEffect(() => {
    // Only run query once user is logged in.
    if (user) {
      router.push('/')
    }
  }, [user])

  if (!user) {
    return (
      <BoxRow justify="center">
        <BoxColumn pad="medium" width={{ min: '500px', max: '800px' }}>
          <Auth
            redirectTo="http://localhost:3000/"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabaseClient}
            providers={[]}
            socialLayout="horizontal"
          />
        </BoxColumn>
      </BoxRow>
    )
  }

  return (
    <>
    </>
  )
}

export default LoginPage

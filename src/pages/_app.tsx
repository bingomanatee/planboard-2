import '~/styles/globals.css'
import type { AppProps } from 'next/app'
import PageFrame from '~/components/PageFrame'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (<SessionContextProvider
    supabaseClient={supabaseClient}
    initialSession={pageProps.initialSession}
  >
    <PageFrame>
      <Component {...pageProps} />
    </PageFrame>
  </SessionContextProvider>)
}

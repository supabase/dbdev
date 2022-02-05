import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'
import AccountInfo from '../components/Account/Info'
import AccountNav from '../components/Account/Nav'
import Auth from '../components/Site/Auth'
import BasicLayout from '../components/Layouts/Basic'
import LeftSidebar from '../components/Layouts/LeftSidebar'

export default function Profile() {
  const [session, setSession] = useState(supabase.auth.session())
  const [user, setUser] = useState(supabase.auth.user())

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
    })
  }, [])

  return !user ? (
    <BasicLayout key={'signed-out'}>
      <Auth />
    </BasicLayout>
  ) : (
    <LeftSidebar key={'signed-in'} sidebar={<AccountNav />}>
      <AccountInfo user={user} />
    </LeftSidebar>
  )
}

import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'
import AccountInfo from '../../components/Account/Info'
import Packages from '../../components/Account/Packages'
import AccountNav from '../../components/Account/Nav'
import Auth from '../../components/Site/Auth'
import BasicLayout from '../../components/Layouts/Basic'
import LeftSidebar from '../../components/Layouts/LeftSidebar'
import { useRouter } from 'next/router'

export default function Info() {
  const router = useRouter()
  const [session, setSession] = useState(supabase.auth.session())
  const [user, setUser] = useState(supabase.auth.user())
  const { section } = router.query

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
      {section == 'info' ? (
        <AccountInfo user={user} />
      ) : section == 'packages' ? (
        <Packages user={user} />
      ) : (
        <div>Not found</div>
      )}
    </LeftSidebar>
  )
}

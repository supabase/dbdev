import { supabase } from 'lib/supabaseClient'
import { useEffect, useState } from 'react'
import AccountInfo from 'components/Account/Info'
import Orgs from 'components/Account/Orgs'
import Packages from 'components/Account/Packages'
import OrgNav from 'components/Org/Nav'
import Auth from 'components/Site/Auth'
import BasicLayout from 'components/Layouts/Basic'
import LeftSidebar from 'components/Layouts/LeftSidebar'
import { useRouter } from 'next/router'
import { account, AccountDetail } from 'pages/api/account'
import Loader from 'components/Site/Loader'
import Error from 'components/Site/Error'
import { useAsync } from 'react-async-hook'
import { asyncError } from 'lib/helpers'
import { packagesByOwner, PackageSummary } from 'pages/api/packages'
import { AuthUser } from '@supabase/supabase-js'
import NewOrg from 'components/Account/NewOrg'

export default function AccountPage() {
  const router = useRouter()
  const [session, setSession] = useState(supabase.auth.session())
  const [user, setUser] = useState(supabase.auth.user())
  const { section } = router.query
  const { loading, error, result } = useAsync(account, [])
  const { data: profile, error: apiError } = result || {}

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      router.push('/account/info')
    })
  }, [])

  return !user ? (
    <BasicLayout key={'signed-out'}>
      <Auth />
    </BasicLayout>
  ) : (
    <LeftSidebar key={'signed-in'} sidebar={<OrgNav profile={profile} />}>
      <>
        {loading && <Loader />}
        {error && <Error error={asyncError(error, apiError)} />}
        {profile && <Profile profile={profile} user={user} section={section as string} />}
      </>
    </LeftSidebar>
  )
}

const Profile = ({
  user,
  profile,
  section,
}: {
  user: AuthUser
  profile: AccountDetail
  section: string
}) => {
  return (
    <>
      {section == 'info' ? (
        <AccountInfo user={user} profile={profile} />
      ) : section == 'packages' ? (
        <PackagesWrapper user={user} />
      ) : section == 'new-org' ? (
        <NewOrg user={user} />
      ) : (
        <div>Not found</div>
      )}
    </>
  )
}

const PackagesWrapper = ({ user }: { user: AuthUser }) => {
  const { loading, error, result } = useAsync(packagesByOwner, [user.app_metadata.handle as string])
  const { data, error: apiError } = result || {}
  return (
    <>
      {loading && <Loader />}
      {error && <Error error={asyncError(error, apiError)} />}
      {data && <Packages user={user} packages={data} />}
    </>
  )
}

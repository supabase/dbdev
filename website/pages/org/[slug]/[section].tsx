import AccountInfo from 'components/Account/Info'
import Packages from 'components/Account/Packages'
import OrgNav from 'components/Account/OrgNav'
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
import { withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'

export default function AccountPage({ user }: { user: AuthUser }) {
  const router = useRouter()
  const { section } = router.query
  const { loading, error, result } = useAsync(account, [user.id])
  const { data: profile, error: apiError } = result || {}

  return (
    <LeftSidebar sidebar={<OrgNav profile={profile} />}>
      <>
        {loading && <Loader />}
        {error && <Error error={asyncError(error, apiError)} />}
        {profile && <Profile profile={profile} user={user} section={section as string} />}
      </>
    </LeftSidebar>
  )
}

export const getServerSideProps = withAuthRequired({ redirectTo: '/login' })

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

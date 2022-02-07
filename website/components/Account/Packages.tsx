import { AuthUser } from '@supabase/supabase-js'
import PackageList from 'components/Packages/PackageList'
import { PackageSummary } from 'pages/api/packages'

export default function AccountPackages({
  user,
  packages,
}: {
  user: AuthUser
  packages: PackageSummary[]
}) {

  return (
    <div className="divide-y">
      {packages.length == 0 ? (
        <div className="p-4">No packages yet.</div>
      ) : (
        <PackageList packages={packages} />
      )}
    </div>
  )
}

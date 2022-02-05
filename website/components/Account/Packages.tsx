import { Checkbox } from '@supabase/ui'
import { Button, Input } from '@supabase/ui'
import { AuthUser } from '@supabase/supabase-js'
import PackageList from '../../components/Packages/PackageList'
import { useEffect, useState } from 'react'
import { packagesByOwner, PackageSummary } from '../../pages/api/packages'

export default function AccountPackages({ user }: { user: AuthUser }) {
  const [packages, setPackages] = useState<PackageSummary[] | null>(null)

  useEffect(() => {
    getPackages()
  }, [user])

  async function getPackages() {
    const handle = user.app_metadata.handle
    const { data, error } = await packagesByOwner(handle as string)
    if (data && !error) setPackages(data)
  }

  return (
    <div className="divide-y">
      {packages === null ? (
        'Loading...'
      ) : packages.length == 0 ? (
        'No packages yet.'
      ) : (
        <PackageList packages={packages} />
      )}
    </div>
  )
}

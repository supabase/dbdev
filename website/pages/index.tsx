import Hero from '../components/Site/Hero'
import Filters from '../components/Packages/Filters'
import PackageList from '../components/Packages/PackageList'
import RightSidebar from '../components/Layouts/RightSidebar'
import { packages, PackageDetail } from '../pages/api/packages'
import { useAsync } from 'react-async-hook'
import Loader from 'components/Site/Loader'

export default function Index() {
  const { loading, error, result } = useAsync(packages, [])
  const { data: packageList, error: apiError } = result || {}

  return (
    <RightSidebar sidebar={FilterBar()}>
      <div className="grid grid-cols-1 gap-4 lg:col-span-2 ">
        <section>
          <Hero />
        </section>
        <section>
          <h2 className="text-xl font-bold p-4">Browse Packages</h2>
          <div className="divide-y border-t">
            {loading && <Loader />}
            {packageList && <PackageList packages={packageList} />}
          </div>
        </section>
      </div>
    </RightSidebar>
  )
}

const FilterBar = () => (
  <section>
    <Filters />
  </section>
)

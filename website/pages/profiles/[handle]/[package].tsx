import DynamicLayout from '~/components/layouts/DynamicLayout'
import { NextPageWithLayout } from '~/lib/types'
import { useParams } from '~/lib/utils'

const PackagePage: NextPageWithLayout = () => {
  const { handle, package: partialPackageName } = useParams()

  return (
    <div>
      <h1>
        hello {handle}/{partialPackageName}
      </h1>
    </div>
  )
}

PackagePage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default PackagePage

import Link from 'next/link'
import dayjs from '~/lib/dayjs'

export type SearchPackageRowProps = {
  handle: string
  partialName: string
  createdAt: string
}

const SearchPackageRow = ({
  handle,
  partialName,
  createdAt,
}: SearchPackageRowProps) => {
  const name = `${handle}/${partialName}`

  return (
    <Link
      href={`/${name}`}
      className="flex items-center justify-between px-4 py-4"
    >
      <span className="dark:text-white">{name}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}
      </span>
    </Link>
  )
}

export default SearchPackageRow

import Link from 'next/link'

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
      <span>{name}</span>
      <span className="text-xs text-gray-500">{createdAt}</span>
    </Link>
  )
}

export default SearchPackageRow

type AvatarProps = {
  name?: string
  avatarUrl?: string
}

const Avatar = ({ name, avatarUrl }: AvatarProps) => {
  if (!avatarUrl) {
    return <div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse" />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="w-6 h-6 rounded-full"
      alt={`Photo of ${name ?? 'Unknown'}`}
      src={avatarUrl}
    />
  )
}

export default Avatar

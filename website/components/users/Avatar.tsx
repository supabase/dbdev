import { cva, cx, VariantProps } from 'class-variance-authority'

const avatar = cva('rounded-full', {
  variants: {
    size: {
      small: 'w-6 h-6',
      medium: 'w-10 h-10',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

type AvatarStyleProps = VariantProps<typeof avatar>

type AvatarProps = AvatarStyleProps & {
  name?: string
  avatarUrl?: string
}

const Avatar = ({ name, avatarUrl, size }: AvatarProps) => {
  if (!avatarUrl) {
    return <div className={cx('bg-gray-100 animate-pulse', avatar({ size }))} />
  }

  return (
    <img
      className={avatar({ size })}
      alt={`Photo of ${name ?? 'Unknown'}`}
      src={avatarUrl}
    />
  )
}

export default Avatar

import { Skeleton } from './skeleton'

interface LoaderRowProps {
  className?: string
  delayIndex?: number
  animationDelay?: number
}

const LoaderRow = ({
  className = '',
  delayIndex = 0,
  animationDelay = 150,
}: LoaderRowProps) => {
  return (
    <Skeleton
      className={`h-6 mx-1 ${className}`}
      style={{
        animationDelay: `${delayIndex * animationDelay}ms`,
      }}
    />
  )
}

const ShimmeringLoader = () => {
  return (
    <div className="w-full space-y-3">
      <LoaderRow />
      <LoaderRow className="w-3/4" />
      <LoaderRow className="w-1/2" />
    </div>
  )
}

export default ShimmeringLoader

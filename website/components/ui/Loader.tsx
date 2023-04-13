const ANIMATION_DELAY = 150

const LoaderRow = ({
  className = '',
  delayIndex = 0,
  animationDelay = 150,
}) => {
  return (
    <div
      className={`shimmering-loader rounded py-3 mx-1 ${className}`}
      style={{
        animationFillMode: 'backwards',
        animationDelay: `${delayIndex * animationDelay}ms`,
      }}
    />
  )
}

const ShimmeringLoader = () => {
  return (
    <div className="w-full space-y-1">
      <LoaderRow />
      <LoaderRow className="w-3/4" />
      <LoaderRow className="w-1/2" />
    </div>
  )
}

export default ShimmeringLoader

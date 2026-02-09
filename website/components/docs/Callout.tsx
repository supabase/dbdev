import { cn } from '~/lib/cn'

const calloutStyles = {
  info: {
    container: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
    title: 'text-blue-800 dark:text-blue-200',
  },
  warn: {
    container:
      'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
    title: 'text-yellow-800 dark:text-yellow-200',
  },
  error: {
    container: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
    title: 'text-red-800 dark:text-red-200',
  },
}

const calloutLabels = {
  info: 'Note',
  warn: 'Warning',
  error: 'Error',
}

export function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warn' | 'error'
  children: React.ReactNode
}) {
  const styles = calloutStyles[type]

  return (
    <div
      className={cn(
        'my-4 rounded-lg border p-4',
        styles.container
      )}
    >
      <p className={cn('text-sm font-semibold mb-1', styles.title)}>
        {calloutLabels[type]}
      </p>
      <div className="text-sm [&>p]:m-0">{children}</div>
    </div>
  )
}

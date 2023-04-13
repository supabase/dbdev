'use client'

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { cva, VariantProps } from 'class-variance-authority'
import { HTMLAttributes, useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

export const copyButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-all',
  {
    variants: {
      variant: {
        light: 'text-slate-900 border-slate-200 hover:bg-slate-100',
        dark: 'text-white border-slate-900 hover:bg-slate-900',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
)

interface CopyButtonProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof copyButtonVariants> {
  getValue: () => string
}

async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value)
}

const CopyButton = ({
  getValue,
  className,
  variant,
  ...props
}: CopyButtonProps) => {
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    let mounted = true

    const id = setTimeout(() => {
      if (mounted) {
        setHasCopied(false)
      }
    }, 2000)

    return () => {
      mounted = false
      clearTimeout(id)
    }
  }, [hasCopied])

  return (
    <button
      className={cn(copyButtonVariants({ variant }), className)}
      onClick={() => {
        copyToClipboardWithMeta(getValue())
        setHasCopied(true)
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <CheckIcon className="w-5 h-5" />
      ) : (
        <ClipboardDocumentIcon className="w-5 h-5 dark:text-white" />
      )}
    </button>
  )
}

export default CopyButton

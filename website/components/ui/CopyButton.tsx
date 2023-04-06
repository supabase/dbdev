'use client'

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { HTMLAttributes, useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  value: string
}

async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value)
}

const CopyButton = ({ value, className, ...props }: CopyButtonProps) => {
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
      className={cn(
        'relative z-20 inline-flex items-center justify-center rounded-md border-slate-900 p-2 text-sm font-medium text-white transition-all hover:bg-slate-900 focus:outline-none',
        className
      )}
      onClick={() => {
        copyToClipboardWithMeta(value)
        setHasCopied(true)
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <CheckIcon className="w-5 h-5" />
      ) : (
        <ClipboardDocumentIcon className="w-5 h-5" />
      )}
    </button>
  )
}

export default CopyButton

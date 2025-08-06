'use client'

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { cva, VariantProps } from 'class-variance-authority'
import { HTMLAttributes, useEffect, useState } from 'react'
import { cn } from '~/lib/utils'
import { Button } from './button'

interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  getValue: () => string
  variant?: 'light' | 'dark'
}

async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value)
}

const CopyButton = ({
  getValue,
  className,
  variant = 'light',
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
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8',
        variant === 'dark' && 'text-muted-foreground hover:text-foreground',
        className
      )}
      onClick={() => {
        copyToClipboardWithMeta(getValue())
        setHasCopied(true)
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4" />
      )}
    </Button>
  )
}

export default CopyButton

import { ClassValue, clsx } from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Params = {
  [k: string]: string | undefined
}

export function useParams(): Params {
  const { query } = useRouter()

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(query).map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, value[0]]
          } else {
            return [key, value]
          }
        })
      ),
    [query]
  )
}

export function firstStr(str: string | string[]) {
  if (Array.isArray(str)) {
    return str[0]
  } else {
    return str
  }
}

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : plural || singular + 's'
}

import { useRouter } from 'next/router'
import { useMemo } from 'react'

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

import { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { NotFoundError, NotImplementedError } from './utils'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on 404s or if we haven't finished writing the code
          if (
            error instanceof NotFoundError ||
            error instanceof NotImplementedError
          ) {
            return false
          }

          if (failureCount < 3) {
            return true
          }

          return false
        },
      },
    },
  })
}

/**
 * useRootQueryClient creates a new query client
 */
export function useRootQueryClient() {
  const [queryClient] = useState(createQueryClient)

  return queryClient
}

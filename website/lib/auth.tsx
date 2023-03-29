import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import {
  ComponentType,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import supabase from './supabase'
import { isNextPageWithLayout, NextPageWithLayout } from './types'

/* Auth Context */

export type AuthContext = { refreshSession: () => Promise<Session | null> } & (
  | {
      session: Session
      isLoading: false
    }
  | {
      session: null
      isLoading: true
    }
  | {
      session: null
      isLoading: false
    }
)

export const AuthContext = createContext<AuthContext>({
  session: null,
  isLoading: true,
  refreshSession: () => Promise.resolve(null),
})

export type AuthProviderProps = {}

export const AuthProvider = ({
  children,
}: PropsWithChildren<AuthProviderProps>) => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session && mounted) {
          setSession(session)
        }

        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return subscription.unsubscribe
  }, [])

  const refreshSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.refreshSession()

    return session
  }, [])

  const value = useMemo(() => {
    if (session) {
      return { session, isLoading: false, refreshSession } as const
    }

    return { session: null, isLoading: isLoading, refreshSession } as const
  }, [session, isLoading, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* Auth Utils */

export const useAuth = () => useContext(AuthContext)

export const useSession = () => useAuth().session

export const useUser = () => useSession()?.user ?? null

export const useIsLoggedIn = () => {
  const user = useUser()

  return user !== null
}

/* With Auth HOC */

export function withAuth<T = {}>(
  Component: ComponentType<T> | NextPageWithLayout<T, T>
) {
  const WithAuth: ComponentType<T> = (props: any) => {
    const { push } = useRouter()
    const { session, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading && !session) {
        push('/sign-in')
      }
    }, [session, isLoading, push])

    return <Component {...props} />
  }

  WithAuth.displayName = `withAuth(${Component.displayName})`

  if (isNextPageWithLayout(Component)) {
    ;(WithAuth as NextPageWithLayout<T, T>).getLayout = Component.getLayout
  }

  return WithAuth
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error?: string | null
}

export type AuthContextType = AuthState & {
  signIn: (params: { email: string; password: string }) => Promise<{ error?: string }>
  signUp: (params: {
    email: string
    password: string
    first_name: string
    middle_name?: string
    last_name: string
    badgenumber: string
  }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, isLoading: true })

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (mounted) {
          setState({ user: session?.user ?? null, session: session ?? null, isLoading: false, error: error?.message })
        }
      } catch (e) {
        if (mounted) setState((s) => ({ ...s, isLoading: false, error: (e as Error).message }))
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setState({ user: session?.user ?? null, session: session ?? null, isLoading: false })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn: AuthContextType['signIn'] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signUp: AuthContextType['signUp'] = async ({ email, password, first_name, middle_name, last_name, badgenumber }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, middle_name: middle_name ?? '', last_name, badgenumber },
      },
    })
    if (error) return { error: error.message }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo<AuthContextType>(
    () => ({ ...state, signIn, signUp, signOut }),
    [state.user, state.session, state.isLoading, state.error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

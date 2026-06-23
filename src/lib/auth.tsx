import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, tokenStore } from './api'

/**
 * Auth real contra o backend NestJS (JWT). Login Google será adicionado depois.
 */

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
}

interface AuthValue {
  user: User | null
  ready: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  // Restaura a sessão a partir do token salvo.
  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!tokenStore.access) {
        if (active) setReady(true)
        return
      }
      try {
        const { data } = await api.get<User>('/auth/me')
        if (active) setUser(data)
      } catch {
        tokenStore.clear()
      } finally {
        if (active) setReady(true)
      }
    }
    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/auth/login', { email, password })
      tokenStore.set(data.accessToken, data.refreshToken)
      setUser(data.user)
    },
    [],
  )

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const { data } = await api.post('/auth/register', {
        email,
        name,
        password,
      })
      tokenStore.set(data.accessToken, data.refreshToken)
      setUser(data.user)
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    // Login Google será implementado em fase posterior (OAuth no backend).
    throw new Error('Login com Google ainda não disponível nesta versão.')
  }, [])

  const signOut = useCallback(() => {
    const refresh = tokenStore.refresh
    if (refresh) void api.post('/auth/logout', { refreshToken: refresh })
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      signInWithPassword,
      register,
      signInWithGoogle,
      signOut,
    }),
    [user, ready, signInWithPassword, register, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

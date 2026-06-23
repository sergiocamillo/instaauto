import axios, { type AxiosError } from 'axios'

/** Base do backend NestJS. Em produção, defina VITE_API_URL. */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

const ACCESS_KEY = 'instauto.access.v1'
const REFRESH_KEY = 'instauto.refresh.v1'

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh automático em 401 (uma tentativa por requisição).
let refreshing: Promise<string | null> | null = null

async function tryRefresh(): Promise<string | null> {
  const refresh = tokenStore.refresh
  if (!refresh) return null
  try {
    const { data } = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refresh,
    })
    tokenStore.set(data.accessToken, data.refreshToken)
    return data.accessToken as string
  } catch {
    tokenStore.clear()
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & {
      _retried?: boolean
    }
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true
      refreshing ??= tryRefresh()
      const newToken = await refreshing
      refreshing = null
      if (newToken) {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

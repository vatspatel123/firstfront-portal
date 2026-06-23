import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import API from '../utils/api'

interface User {
  id: string
  email: string
  phone: string
  role: string
  company_name?: string
  name?: string
  is_verified?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  signup: (data: any) => Promise<any>
  login: (email: string, password: string) => Promise<void>
  verifyOtp: (email: string, code: string) => Promise<void>
  logout: () => void
  init: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      signup: async (data) => {
        const res = await API.post('/api/auth/signup', data)
        return res.data
      },

      login: async (email, password) => {
        const res = await API.post('/api/auth/login', { email, password })
        set({ token: res.data.access_token, user: res.data })
      },

      verifyOtp: async (email, code) => {
        await API.post('/api/auth/verify-otp', { email, code })
      },

      logout: () => {
        set({ user: null, token: null })
      },

      init: () => {
        set({ isLoading: false })
      },

      fetchMe: async () => {
        try {
          const res = await API.get('/api/auth/me')
          set({ user: { ...get().user, ...res.data } })
        } catch {
          // Token expired or invalid
        }
      }
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
)

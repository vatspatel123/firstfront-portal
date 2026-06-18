import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import API from '../utils/api'

export type UserRole = 'client' | 'designer' | 'admin' | 'sales'

interface User {
  user_id: string
  role: UserRole
  name: string
  email?: string
  phone?: string
  company_name?: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: { name: string; company_name: string; contact_person: string; email: string; phone: string; password: string }) => Promise<{ email: string; phone: string }>
  verifyOTP: (email: string | null, phone: string | null, code: string) => Promise<void>
  resendOTP: (email: string | null, phone: string | null) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password })
        localStorage.setItem('firstfront-token', data.access_token)
        set({
          token: data.access_token,
          user: {
            user_id: data.user_id,
            role: data.role as UserRole,
            name: data.name || '',
            company_name: data.company_name,
          },
          isAuthenticated: true,
        })
      },

      signup: async (signupData) => {
        const { data } = await API.post('/auth/signup', signupData)
        return { email: data.email, phone: data.phone }
      },

      verifyOTP: async (email, phone, code) => {
        await API.post('/auth/verify-otp', { email, phone, code, purpose: 'signup' })
      },

      resendOTP: async (email, phone) => {
        await API.post('/auth/resend-otp', null, { params: { email, phone } })
      },

      fetchMe: async () => {
        try {
          const { data } = await API.get('/auth/me')
          set({
            user: {
              user_id: data.user_id,
              role: data.role as UserRole,
              name: data.name || '',
              company_name: data.company_name,
            },
          })
        } catch {
          // If /me fails, user may have been deleted or token invalid
        }
      },

      logout: () => {
        localStorage.removeItem('firstfront-token')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'firstfront-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

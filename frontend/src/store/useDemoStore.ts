import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DemoRole = 'client' | 'designer' | 'admin'

interface DemoState {
  role: DemoRole
  setRole: (role: DemoRole) => void
  notifications: number
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      role: 'client',
      setRole: (role) => set({ role }),
      notifications: 3,
    }),
    { name: 'firstfront-demo' }
  )
)

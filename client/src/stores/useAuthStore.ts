import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  username: string
  email: string
  eloRating: number
  boardLightColor: string | null
  boardDarkColor: string | null
  pieceColorLight: string | null
  pieceColorDark: string | null
  createdAt: string | null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setUser: (user: AuthUser) => void
  markHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'jhesster-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

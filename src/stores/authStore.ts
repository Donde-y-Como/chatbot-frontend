import { create } from 'zustand'
import { UserData } from '@/features/auth/types.ts'

const ACCESS_TOKEN = 'thisisjustarandomstring'

interface AuthState {
  auth: {
    user: UserData | null
    setUser: (user: UserData) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    isAuthenticated: () => boolean
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = localStorage.getItem(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  const initUser = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null
  return {
    auth: {
      user: initUser,
      setUser: (user: UserData) =>
        set((state) => {
          localStorage.setItem('user', JSON.stringify(user))
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          localStorage.setItem(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          localStorage.removeItem('user')
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          localStorage.removeItem('user')
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
      isAuthenticated: () => {
        const token = get().auth.accessToken
        return !!token
      },
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)

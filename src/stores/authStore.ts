import { create } from 'zustand'
import { UserData, BusinessData } from '@/features/auth/types.ts'

const ACCESS_TOKEN = 'thisisjustarandomstring'

interface AuthState {
  auth: {
    user: UserData | null
    business: BusinessData | null
    setUser: (user: UserData) => void
    setBusiness: (business: BusinessData) => void
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
  const initBusiness = localStorage.getItem('business')
    ? JSON.parse(localStorage.getItem('business')!)
    : null
  return {
    auth: {
      user: initUser,
      business: initBusiness,
      setUser: (user: UserData) =>
        set((state) => {
          localStorage.setItem('user', JSON.stringify(user))
          return { ...state, auth: { ...state.auth, user } }
        }),
      setBusiness: (business: BusinessData) =>
        set((state) => {
          localStorage.setItem('business', JSON.stringify(business))
          return { ...state, auth: { ...state.auth, business } }
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
          localStorage.removeItem('business')
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          localStorage.removeItem('user')
          localStorage.removeItem('business')
          return {
            ...state,
            auth: { ...state.auth, user: null, business: null, accessToken: '' },
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

import { api } from '@/api/axiosInstance'
import { useAuthStore } from '@/stores/authStore.ts'
import { LoginData, UserData } from '@/features/auth/types.ts'

export const authService = {
  login: async (credentials: LoginData) => {
    const response = await api.post<{ token: string }>(
      '/auth/login',
      credentials
    )
    return response.data
  },

  logout: () => {
    useAuthStore.getState().auth.reset()
  },

  getMe: async () => {
    const response = await api.get<UserData>('/auth/user')
    return response.data
  },
}

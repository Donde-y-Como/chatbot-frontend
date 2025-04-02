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

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  verifyResetToken: async (token: string): Promise<boolean> => {
    try {
      const response = await api.post(`/auth/reset-password/${token}/verify`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password: newPassword });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  requestLoginLink: async (email: string): Promise<void> => {
    await api.post('/auth/request-login-link', { email });
  },

  verifyLoginLink: async (token: string): Promise<{ token: string }> => {
    const response = await api.get<{ token: string }>(`/auth/verify-login-link/${token}`);
    return response.data;
  }
}

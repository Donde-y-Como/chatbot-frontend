import { api } from '@/api/axiosInstance'
import { useAuthStore } from '@/stores/authStore.ts'
import { 
  LoginData, 
  LoginResponse, 
  UserData, 
  BusinessData, 
  UpdateCredentialsData,
  Role,
  CreateRoleData,
  UpdateRoleData,
  PermissionsResponse
} from '@/features/auth/types.ts'

export const authService = {
  login: async (credentials: LoginData) => {
    const response = await api.post<LoginResponse>(
      '/auth/login',
      credentials
    )
    return response.data
  },

  logout: () => {
    useAuthStore.getState().auth.reset()
  },

  getMe: async () => {
    const response = await api.get<UserData>('/auth/me')
    return response.data
  },

  getMyBusiness: async () => {
    const response = await api.get<BusinessData>('/my-business')
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
  },

  toggleNotifications: async (enabled: boolean): Promise<{ message: string; notificationsEnabled: boolean }> => {
    const response = await api.post<{ message: string; notificationsEnabled: boolean }>('/business/notifications/toggle', { enabled });
    return response.data;
  },

  updateCredentials: async (data: UpdateCredentialsData): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/auth/update-credentials', data);
    return response.data;
  },

  // Role management functions
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },

  getRole: async (roleId: string): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${roleId}`);
    return response.data;
  },

  getPermissions: async (): Promise<PermissionsResponse> => {
    const response = await api.get<PermissionsResponse>('/roles/permissions');
    return response.data;
  },

  createRole: async (data: CreateRoleData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/roles', data);
    return response.data;
  },

  updateRole: async (roleId: string, data: UpdateRoleData): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/roles/${roleId}`, data);
    return response.data;
  },

  deleteRole: async (roleId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/roles/${roleId}`);
    return response.data;
  }
}

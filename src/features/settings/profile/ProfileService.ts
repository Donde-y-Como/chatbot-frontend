import { api } from '@/api/axiosInstance.ts'
import { BusinessSchedule,
          UpdateBusinessScheduleRequest,
          UpdateUserRequest,
          UserData
        } from '@/features/settings/profile/types.ts'

export const ProfileService = {
  getMe: async () => {
    const response = await api.get<UserData>('/auth/user')
    return response.data
  },
  
  updateProfile: async (data: UpdateUserRequest) => {
    const response = await api.put<UserData>('/auth/user', data)
    return response.data
  }
}


export const ScheduleService = {
  getSchedule: async () => {
    const response = await api.get<BusinessSchedule>('/schedule')
    return response.data
  },

  updateSchedule: async (data: UpdateBusinessScheduleRequest) => {
    const response = await api.put<BusinessSchedule>('/schedule', data)
    return response.data
  }
}
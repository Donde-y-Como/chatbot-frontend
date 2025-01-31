import { api } from '@/api/axiosInstance'
import { Appointment } from '@/features/appointments/types.ts'

export const appointmentService = {
  getAppointments: async (startDate: string, endDate: string) => {
    let endpoint = '/appointments'
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`
    }
    const response = await api.get<Appointment[]>(endpoint)
    return response.data
  },

}

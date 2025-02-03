import { api } from '@/api/axiosInstance'
import { Appointment, Employee, Service, Schedule } from '@/features/appointments/types.ts'
const generatePastelColor = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }

  const r = ((hash & 0xFF0000) >> 16) & 0x7F + 128
  const g = ((hash & 0x00FF00) >> 8) & 0x7F + 128
  const b = (hash & 0x0000FF) & 0x7F + 128

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export const appointmentService = {
  getAppointments: async (startDate: string, endDate: string) => {
    let endpoint = '/appointments'
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`
    }
    const response = await api.get<Appointment[]>(endpoint)
    return response.data
  },

  getEmployees: async(): Promise<Employee[]> => {
    const response = await api.get<Omit<Employee,"color">[]>('/employees')
    return response.data.map((emp) => ({
      ...emp,
      color: generatePastelColor(emp.id)
    }))
  },

  getServices: async(): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services')
    return response.data;
  },

  getSchedule: async() => {
    const response = await api.get<Schedule>('/schedule')
    return response.data;
  }
}

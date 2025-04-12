import { api } from '@/api/axiosInstance'
import {
  Appointment,
  AppointmentCreated,
  Schedule,
  Service
} from '@/features/appointments/types.ts'
import { ClientPrimitives } from '../clients/types'



export const appointmentService = {
  cancelAppointment: async (appointmentId: string) => {
    await api.delete(`/appointments/${appointmentId}`)
  },

  makeAppointment: async (appointment: Partial<Appointment>) => {
    const response = await api.post<{ appointment: AppointmentCreated }>(
      '/appointments',
      appointment
    )
    return response.data.appointment
  },

  editAppointment: async (id: string, appointment: Partial<Appointment>) => {
    const response = await api.put(
      `/appointments/${id}`,
      appointment
    )
    return response.data as AppointmentCreated;
  },

  getAppointments: async (startDate: string, endDate: string) => {
    let endpoint = '/appointments'
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`
    }
    const response = await api.get<Appointment[]>(endpoint)
    return response.data
  },

  getServices: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services')
    return response.data
  },

  getSchedule: async () => {
    const response = await api.get<Schedule>('/schedule')
    return response.data
  },

  getClients: async () => {
    const response = await api.get<ClientPrimitives[]>('/clients')
    return response.data
  },

}

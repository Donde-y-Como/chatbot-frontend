import { api } from '@/api/axiosInstance'
import {
  Appointment,
  AppointmentCreated,
  Event,
  Schedule,
  Service,
} from '@/features/appointments/types.ts'
import { Client } from '@/features/chats/ChatTypes.ts'



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
    const response = await api.get<Client[]>('/clients')
    return response.data
  },

  createEvent: async (event: Omit<Event, "id">) => {
    const response = await api.post('/events', event)
    return response.status === 201
  },

  getEvents: async () => {
    const response = await api.get<Event[]>('/events')
    return response.data
  },
}

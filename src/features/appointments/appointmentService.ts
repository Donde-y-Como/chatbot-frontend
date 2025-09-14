import { api } from '@/api/axiosInstance'
import {
  Appointment,
  AppointmentCreated,
  AvailabilityResult,
  Schedule,
  Service,
  AppointmentApiData,
} from '@/features/appointments/types.ts'
import { ClientPrimitives } from '../clients/types'
import { isValid } from 'date-fns'

export const appointmentService = {
  cancelAppointment: async (appointmentId: string) => {
    // En lugar de eliminar, cambiar el estado a cancelada
    const response = await api.put(`/appointments/${appointmentId}`, {
      status: 'cancelada',
    })
    return response.data
  },

  makeAppointment: async (appointment: Partial<Appointment>) => {
    // Convertir a formato de API si es necesario
    const apiData: any = { ...appointment }
    
    // Convertir reminder.day de Date a string si existe
    if (appointment.reminder && appointment.reminder.day instanceof Date) {
      apiData.reminder = {
        ...appointment.reminder,
        day: appointment.reminder.day.toISOString().split('T')[0]
      }
    }
    
    const response = await api.post<AppointmentCreated>(
      '/appointments',
      apiData
    )
    return response.data
  },

  editAppointment: async (id: string, appointment: Partial<Appointment>) => {
    // Convertir Appointment a AppointmentApiData si tiene reminder con Date
    const apiData: any = { ...appointment }
    
    if (appointment.reminder && appointment.reminder.day instanceof Date) {
      apiData.reminder = {
        ...appointment.reminder,
        day: appointment.reminder.day.toISOString().split('T')[0]
      }
    }
    
    // No verificar date instanceof Date porque en Appointment.date es string
    
    const response = await api.put(`/appointments/${id}`, apiData)
    return response.data as AppointmentCreated
  },

  getAppointments: async (startDate: string, endDate: string) => {
    let endpoint = '/appointments'

    if (startDate.length > 0 && endDate.length > 0) {
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

  checkAvailability: async (serviceId: string, date: Date) => {
    const response = await api.get<AvailabilityResult>(
      `/appointments/availability`,
      {
        params: {
          serviceId,
          date: date.toISOString(),
        },
      }
    )

    return response.data
  },

  updateAppointmentsClientId: async (oldClientId: string, newClientId: string) => {
    const response = await api.patch('/appointments/update-client', {
      oldClientId,
      newClientId,
    })
    return response.data
  },
}

import { api } from '@/api/axiosInstance'
import {
  Appointment,
  AppointmentCreated,
  AvailabilityResult,
  EmployeeAvailabilityResult,
  Schedule,
  Service,
} from '@/features/appointments/types.ts'
import { ClientPrimitives } from '../clients/types'
import { isValid } from 'date-fns'

export const appointmentService = {
  cancelAppointment: async (appointmentId: string) => {
    // Ahora el backend maneja el status == cancelada en lugar de eliminar
    const response = await api.delete(`/appointments/${appointmentId}`)
    return response.data
  },

  makeAppointment: async (appointment: Partial<Appointment>) => {
    const response = await api.post<AppointmentCreated>(
      '/appointments',
      appointment
    )
    return response.data
  },

  editAppointment: async (id: string, appointment: Partial<Appointment>) => {
    const response = await api.put(`/appointments/${id}`, appointment)
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

  checkAvailability: async (serviceId: string, date: Date, appointmentId?: string) => {
    const response = await api.get<AvailabilityResult>(
      `/appointments/availability`,
      {
        params: {
          serviceId,
          date: date.toISOString(),
          ...(appointmentId && { appointmentId }),
        },
      }
    )

    return response.data
  },

  checkEmployeeAvailability: async (
    fromDate: Date,
    toDate: Date,
    employeeIds?: string[],
    appointmentId?: string
  ) => {
    const response = await api.get<EmployeeAvailabilityResult>(
      `/appointments/employees/availability`,
      {
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          ...(employeeIds && employeeIds.length > 0 && { employeeIds: employeeIds.join(',') }),
          ...(appointmentId && { appointmentId }),
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

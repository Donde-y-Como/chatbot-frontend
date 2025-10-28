import { portalApi } from '@/api/axiosInstance'
import {
  ClientPortalAppointment,
  CreateClientPortalAppointmentRequest,
  ClientPortalService,
  ClientPortalProfile,
  CheckAvailabilityRequest,
  ClientPortalAvailabilityResponse
} from '../clientPortalTypes'

export const ClientPortalApiService = {
  // ============================================
  // Appointments
  // ============================================

  getAppointments: async (token: string): Promise<ClientPortalAppointment[]> => {
    const response = await portalApi.get<ClientPortalAppointment[]>('/client-portal/appointments', {
      headers: {
        'X-Portal-Token': token
      }
    })

    if (response.status !== 200) {
      throw new Error('Error al obtener las citas')
    }

    return response.data
  },

  getAppointmentById: async (appointmentId: string, token: string): Promise<ClientPortalAppointment> => {
    const response = await portalApi.get<ClientPortalAppointment>(
      `/client-portal/appointments/${appointmentId}`,
      {
        headers: {
          'X-Portal-Token': token
        }
      }
    )

    if (response.status !== 200) {
      throw new Error('Error al obtener la cita')
    }

    return response.data
  },

  createAppointment: async (
    token: string,
    request: CreateClientPortalAppointmentRequest
  ): Promise<ClientPortalAppointment> => {
    const response = await portalApi.post<ClientPortalAppointment>(
      '/client-portal/appointments',
      request,
      {
        headers: {
          'X-Portal-Token': token
        }
      }
    )

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('Error al crear la cita')
    }

    return response.data
  },

  checkAvailability: async (
    token: string,
    request: CheckAvailabilityRequest
  ): Promise<ClientPortalAvailabilityResponse> => {
    // Backend solo acepta un servicio, tomamos el primero del array
    const params = {
      serviceId: request.serviceIds[0], // Solo el primer servicio
      employeeId: request.employeeIds?.[0], // Solo el primer empleado (si existe)
      date: request.date
    }

    const response = await portalApi.get<any>(
      '/client-portal/appointments/availability',
      {
        params,
        headers: {
          'X-Portal-Token': token
        }
      }
    )

    if (response.status !== 200) {
      throw new Error('Error al verificar disponibilidad')
    }

    // Transformar la respuesta del backend al formato esperado por el frontend
    const availableSlots = response.data.availableSlots.map((item: any) => ({
      startAt: item.slot.startAt,
      endAt: item.slot.endAt,
      available: true,
      employees: item.employees
    }))

    return {
      date: request.date,
      availableSlots
    }
  },

  // ============================================
  // Services
  // ============================================

  getServices: async (token: string): Promise<ClientPortalService[]> => {
    const response = await portalApi.get<ClientPortalService[]>('/client-portal/services', {
      headers: {
        'X-Portal-Token': token
      }
    })

    if (response.status !== 200) {
      throw new Error('Error al obtener los servicios')
    }

    return response.data
  },

  // ============================================
  // Profile
  // ============================================

  getProfile: async (token: string): Promise<ClientPortalProfile> => {
    const response = await portalApi.get<ClientPortalProfile>('/client-portal/profile', {
      headers: {
        'X-Portal-Token': token
      }
    })

    if (response.status !== 200) {
      throw new Error('Error al obtener el perfil')
    }

    return response.data
  }
}

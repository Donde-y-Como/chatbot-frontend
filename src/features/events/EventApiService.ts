import { api } from '@/api/axiosInstance.ts'
import { EventPrimitives } from '@/features/events/types.ts'

export const EventApiService = {
  updateEvent: async (eventId: string, changes: Partial<EventPrimitives>) => {
    const response = await api.put(`/events/${eventId}`, changes)
    if (response.status !== 200) {
      throw new Error('Error updating event')
    }
  },

  deleteEvent: async (eventId: string) => {
    const response = await api.delete(`/events/${eventId}`)
    if (response.status !== 200) {
      throw new Error('Error deleting event')
    }
  },

  createEvent: async (event: Omit<EventPrimitives, 'id' | 'businessId'>) => {
    const response = await api.post('/events', event)
    if (response.status !== 201) {
      throw new Error('Error creating event')
    }
    return response.data
  },

  bookGroupEvent: async (eventId: string, clientIds: string[], date: string) => {
    const response = await api.post(`/events/${eventId}/group-booking`, { clientIds, date })
    if (response.status !== 201) {
      throw new Error('Error booking group event')
    }
  },

  bookEvent: async (data: { eventId: string, clientId: string, date: string, participants: number, notes?: string, status?: string, amount?: number, paymentStatus?: string }) => {
    const { eventId, ...bookData } = data;
    try {
      const response = await api.post(`/events/${eventId}/book`, { ...bookData })
      return response.data
    } catch (error: any) {
      // Re-lanzar el error con más contexto para manejo en el hook
      if (error.response?.status === 400 || error.response?.status === 409) {
        throw error // Mantener el error original para que el hook pueda procesarlo
      }
      throw new Error('Error booking event')
    }
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.delete(`/bookings/${bookingId}`)
    if (response.status !== 200) {
      throw new Error('Error removing the booking for the event')
    }
  },

  updateBooking: async (bookingId: string, data: { date?: string, participants?: number, notes?: string, status?: string, amount?: number, paymentStatus?: string }) => {
    const response = await api.put(`/bookings/${bookingId}`, data)
    if (response.status !== 200) {
      throw new Error('Error updating booking')
    }
    return response.data
  },
}

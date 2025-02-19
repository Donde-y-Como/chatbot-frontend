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
  },

  bookEvent: async (eventId: string, clientIds: string[], date:string) => {
    const response = await api.post(`/events/${eventId}/group-booking`, { clientIds, date })
    if (response.status !== 201) {
      throw new Error('Error booking event')
    }
  },
}

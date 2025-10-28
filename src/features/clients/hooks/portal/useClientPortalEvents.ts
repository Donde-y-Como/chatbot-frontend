import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '@/api/axiosInstance'

export interface PortalEvent {
  id: string
  name: string
  description: string
  duration: {
    startAt: string
    endAt: string
  }
  capacity: {
    isLimited: boolean
    maxCapacity?: number | null
  }
  price: {
    amount: number
    currency: string
  }
  location: string
  photos: string[]
  availableDates: string[] // Available occurrence dates
}

export interface EventBookingRequest {
  eventId: string
  date: string
  participants: number
  notes?: string
  clientForId?: string // For booking on behalf of someone else
}

export interface EventBookingResponse {
  success: boolean
  bookingId?: string
  message: string
}

export interface ClientEventBooking {
  id: string
  eventId: string
  eventName: string
  date: string
  participants: number
  notes?: string
  status: 'pendiente' | 'confirmada' | 'reprogramada' | 'completada' | 'cancelada' | 'no asistió'
  amount: number
  paymentStatus: 'pendiente' | 'pagado' | 'parcial' | 'reembolsado'
  createdAt: string
  clientForName?: string // Name of person the booking was made for
}

const getPortalEvents = async (clientId: string, token: string): Promise<PortalEvent[]> => {
  const response = await portalApi.get<{success: boolean, data: PortalEvent[], message: string}>(
    `/clients/portal/${clientId}/available-events`,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener eventos disponibles')
  }

  return response.data.data
}

const getEventBookingHistory = async (clientId: string, token: string): Promise<ClientEventBooking[]> => {
  const response = await portalApi.get<{success: boolean, data: ClientEventBooking[], message: string}>(
    `/clients/portal/${clientId}/event-bookings`,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener historial de eventos')
  }

  return response.data.data
}

const createEventBooking = async (
  clientId: string,
  token: string,
  booking: EventBookingRequest
): Promise<EventBookingResponse> => {
  const response = await portalApi.post<EventBookingResponse>(
    `/clients/portal/${clientId}/book-event`,
    booking,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  return response.data
}

export function useClientPortalEvents(clientId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-events', clientId, token],
    queryFn: () => getPortalEvents(clientId, token),
    enabled: enabled && !!clientId && !!token,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  })
}

export function useClientPortalEventBookingHistory(clientId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-event-bookings', clientId, token],
    queryFn: () => getEventBookingHistory(clientId, token),
    enabled: enabled && !!clientId && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useClientPortalEventBooking(clientId: string, token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (booking: EventBookingRequest) => createEventBooking(clientId, token, booking),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-portal-event-bookings', clientId] })
      queryClient.invalidateQueries({ queryKey: ['client-portal-events', clientId] })
    },
  })
}
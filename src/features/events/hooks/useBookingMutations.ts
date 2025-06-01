import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EventApiService } from '../EventApiService'
import { UpdateBookingData } from '../types'
import { toast } from 'sonner'

// Tipo específico para los datos de creación de booking
type CreateBookingData = {
  eventId: string
  clientId: string
  date: string
  participants: number
  notes?: string
  status?: string
  amount?: number
  paymentStatus?: string
}

export function useBookingMutations() {
  const queryClient = useQueryClient()

  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingData }) =>
      EventApiService.updateBooking(bookingId, data),
    onSuccess: async () => {
      // Invalidar y refrescar las queries de eventos y reservas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['event'] }), // Invalidar todas las queries que empiecen con 'event'
      ])
      
      toast.success("Reserva actualizada correctamente")
    },
    onError: (error) => {
      console.error('Error updating booking:', error)
      toast.error("No se pudo actualizar la reserva. Intenta de nuevo.")
    },
  })

  const createBookingMutation = useMutation({
    mutationFn: (bookingData: CreateBookingData) => {
      const { eventId, ...data } = bookingData
      return EventApiService.bookEvent({ eventId, ...data })
    },
    onSuccess: async () => {
      // Invalidar y refrescar las queries de eventos y reservas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['event'] }), // Invalidar todas las queries que empiecen con 'event'
      ])
      
      toast.success("Reserva creada correctamente")
    },
    onError: (error) => {
      console.error('Error creating booking:', error)
      toast.error("No se pudo crear la reserva. Intenta de nuevo.")
    },
  })

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) => EventApiService.cancelBooking(bookingId),
    onSuccess: async () => {
      // Invalidar y refrescar las queries de eventos y reservas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['event'] }), // Invalidar todas las queries que empiecen con 'event'
      ])
      
      toast.success("Reserva eliminada correctamente")
    },
    onError: (error) => {
      console.error('Error deleting booking:', error)
      toast.error("No se pudo eliminar la reserva. Intenta de nuevo.")
    },
  })

  return {
    updateBooking: updateBookingMutation.mutateAsync,
    createBooking: createBookingMutation.mutateAsync,
    deleteBooking: deleteBookingMutation.mutateAsync,
    isUpdatingBooking: updateBookingMutation.isPending,
    isCreatingBooking: createBookingMutation.isPending,
    isDeletingBooking: deleteBookingMutation.isPending,
  }
}

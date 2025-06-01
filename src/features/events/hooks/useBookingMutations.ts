import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EventApiService } from '../EventApiService'
import { UpdateBookingData } from '../types'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()

  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingData }) =>
      EventApiService.updateBooking(bookingId, data),
    onSuccess: () => {
      // Invalidar y refrescar las queries de eventos y reservas
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['eventWithBookings'] })
      
      toast({
        title: "Reserva actualizada",
        description: "La reserva se ha actualizado correctamente.",
      })
    },
    onError: (error) => {
      console.error('Error updating booking:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva. Intenta de nuevo.",
        variant: "destructive",
      })
    },
  })

  const createBookingMutation = useMutation({
    mutationFn: (bookingData: CreateBookingData) => {
      const { eventId, ...data } = bookingData
      return EventApiService.bookEvent({ eventId, ...data })
    },
    onSuccess: () => {
      // Invalidar y refrescar las queries de eventos y reservas
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['eventWithBookings'] })
      
      toast({
        title: "Reserva creada",
        description: "La reserva se ha creado correctamente.",
      })
    },
    onError: (error) => {
      console.error('Error creating booking:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Intenta de nuevo.",
        variant: "destructive",
      })
    },
  })

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) => EventApiService.cancelBooking(bookingId),
    onSuccess: () => {
      // Invalidar y refrescar las queries de eventos y reservas
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['eventWithBookings'] })
      
      toast({
        title: "Reserva eliminada",
        description: "La reserva se ha eliminado correctamente.",
      })
    },
    onError: (error) => {
      console.error('Error deleting booking:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva. Intenta de nuevo.",
        variant: "destructive",
      })
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

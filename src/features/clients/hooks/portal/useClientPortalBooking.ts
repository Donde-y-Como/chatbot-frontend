import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientPortalApiService } from '../../services/ClientPortalApiService'
import { CreateClientPortalAppointmentRequest } from '../../clientPortalTypes'

/**
 * Hook para crear una cita desde el portal del cliente
 * Usa el nuevo endpoint /client-portal/appointments
 */
export function useClientPortalBooking(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (booking: CreateClientPortalAppointmentRequest) =>
      ClientPortalApiService.createAppointment(token, booking),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-portal-appointments', token] })
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { ClientPortalApiService } from '../../services/ClientPortalApiService'

export function useClientPortalAppointments(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-appointments', token],
    queryFn: () => ClientPortalApiService.getAppointments(token),
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useClientPortalAppointmentById(appointmentId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-appointment', appointmentId, token],
    queryFn: () => ClientPortalApiService.getAppointmentById(appointmentId, token),
    enabled: enabled && !!appointmentId && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}
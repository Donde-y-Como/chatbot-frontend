import { useQuery } from '@tanstack/react-query'
import { ClientPortalApiService } from '../../services/ClientPortalApiService'
import { CheckAvailabilityRequest } from '../../clientPortalTypes'

/**
 * Hook para verificar disponibilidad de horarios en el portal del cliente
 * @param token - Token de acceso al portal
 * @param request - Parámetros para verificar disponibilidad (serviceIds, date, etc.)
 * @param enabled - Si la query debe ejecutarse
 */
export function useClientPortalAvailability(
  token: string,
  request: CheckAvailabilityRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['client-portal-availability', token, request],
    queryFn: () => ClientPortalApiService.checkAvailability(token, request),
    enabled: enabled && !!token && !!request.date && request.serviceIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - availability changes frequently
    retry: 2,
  })
}

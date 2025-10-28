import { useQuery } from '@tanstack/react-query'
import { ClientPortalApiService } from '../../services/ClientPortalApiService'

/**
 * Hook para obtener el perfil del cliente en el portal
 * @param token - Token de acceso al portal
 * @param enabled - Si la query debe ejecutarse
 */
export function useClientPortalProfile(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-profile', token],
    queryFn: () => ClientPortalApiService.getProfile(token),
    enabled: enabled && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile doesn't change frequently
    retry: 2,
  })
}

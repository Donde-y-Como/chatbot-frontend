import { useQuery } from '@tanstack/react-query'
import { ClientPortalApiService } from '../../services/ClientPortalApiService'

export function useClientPortalServices(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-services', token],
    queryFn: () => ClientPortalApiService.getServices(token),
    enabled: enabled && !!token,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  })
}

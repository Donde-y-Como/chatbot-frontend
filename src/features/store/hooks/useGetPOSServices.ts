import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'

export function useGetPOSServices() {
  return useQuery({
    queryKey: ['pos-services'],
    queryFn: POSApiService.getServices,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })
}
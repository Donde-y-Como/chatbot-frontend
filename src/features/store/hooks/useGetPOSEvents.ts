import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'

export function useGetPOSEvents() {
  return useQuery({
    queryKey: ['pos-events'],
    queryFn: POSApiService.getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })
}
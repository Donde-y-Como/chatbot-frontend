import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'

export function useGetPOSProducts() {
  return useQuery({
    queryKey: ['pos-products'],
    queryFn: POSApiService.getProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })
}
import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'
import { POSFilters } from '../types'

export function useGetPOSProducts(filters?: Partial<POSFilters>) {
  return useQuery({
    queryKey: ['pos-products', filters],
    queryFn: () => {
      const apiFilters = filters ? {
        categoryIds: filters.categories,
        tagIds: filters.tags,
        status: filters.status,
        unitIds: filters.units
      } : undefined
      
      return POSApiService.getProducts(apiFilters)
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })
}
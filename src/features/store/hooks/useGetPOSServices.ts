import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'
import { POSFilters } from '../types'

export function useGetPOSServices(filters?: Partial<POSFilters>) {
  return useQuery({
    queryKey: ['pos-services', filters],
    queryFn: () => {
      const apiFilters = filters ? {
        categoryIds: filters.categories,
        tagIds: filters.tags,
        status: filters.status,
        unidadMedida: filters.unidadMedida
      } : undefined
      
      return POSApiService.getServices(apiFilters)
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })
}
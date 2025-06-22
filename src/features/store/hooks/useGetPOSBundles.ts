import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'
import { Bundle } from '../types'
import { POSFilters } from '../types'

/**
 * Hook para obtener bundles del POS con filtros opcionales
 */
export function useGetPOSBundles(filters?: POSFilters) {
  // Crear una query key más específica basada en los filtros reales
  const bundleFilters: { tagIds?: string[]; status?: string } = {}
  
  if (filters?.tags?.length) {
    bundleFilters.tagIds = filters.tags
  }
  
  if (filters?.status) {
    bundleFilters.status = filters.status
  }

  return useQuery<Bundle[], Error>({
    queryKey: ['pos-bundles', bundleFilters],
    queryFn: async () => {
      const result = await POSApiService.getBundles(bundleFilters)
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: true
  })
}

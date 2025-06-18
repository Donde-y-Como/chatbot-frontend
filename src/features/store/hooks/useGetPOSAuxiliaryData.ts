import { useQuery } from '@tanstack/react-query'
import { AuxiliaryData } from '../types'
import { POSApiService } from '../services/POSApiService'

export function useGetPOSAuxiliaryData() {
  const tagsQuery = useQuery({
    queryKey: ['pos-tags'],
    queryFn: POSApiService.getProductTags,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  })

  const categoriesQuery = useQuery({
    queryKey: ['pos-categories'],
    queryFn: POSApiService.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  })

  const unitsQuery = useQuery({
    queryKey: ['pos-units'],
    queryFn: POSApiService.getUnits,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  })

  const auxiliaryData: AuxiliaryData = {
    tags: tagsQuery.data || [],
    categories: categoriesQuery.data || [],
    units: unitsQuery.data || []
  }

  return {
    data: auxiliaryData,
    isLoading: tagsQuery.isLoading || categoriesQuery.isLoading || unitsQuery.isLoading,
    error: tagsQuery.error || categoriesQuery.error || unitsQuery.error,
    refetch: () => {
      tagsQuery.refetch()
      categoriesQuery.refetch()
      unitsQuery.refetch()
    }
  }
}
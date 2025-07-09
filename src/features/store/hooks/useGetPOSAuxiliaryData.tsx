import { useQuery } from '@tanstack/react-query'
import { ProductApiService } from '@/features/products/ProductApiService.ts'
import { AuxiliaryData } from '../types'

export function useGetPOSAuxiliaryData() {
  const tagsQuery = useQuery({
    queryKey: ['pos-tags'],
    queryFn: ProductApiService.getProductTags,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  })

  const categoriesQuery = useQuery({
    queryKey: ['pos-categories'],
    queryFn: ProductApiService.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  })

  const unitsQuery = useQuery({
    queryKey: ['pos-units'],
    queryFn: ProductApiService.getUnits,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  })

  const auxiliaryData: AuxiliaryData = {
    tags: tagsQuery.data || [],
    categories: categoriesQuery.data || [],
    subcategories: [], // No disponible en backend por ahora
    units: unitsQuery.data || [],
    unidadesMedida: [], // No disponible en backend por ahora
    statuses: [
      { id: 'active', name: 'Activo' },
      { id: 'inactive', name: 'Inactivo' },
      { id: 'draft', name: 'Borrador' },
    ],
  }

  return {
    data: auxiliaryData,
    isLoading:
      tagsQuery.isLoading || categoriesQuery.isLoading || unitsQuery.isLoading,
    error: tagsQuery.error || categoriesQuery.error || unitsQuery.error,
    refetch: () => {
      void tagsQuery.refetch()
      void categoriesQuery.refetch()
      void unitsQuery.refetch()
    },
  }
}

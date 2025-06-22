import { useQuery } from '@tanstack/react-query'
import { POSApiService } from '../services/POSApiService'
import { POSFilters } from '../types'
import { format } from 'date-fns'

export function useGetPOSEvents(filters?: Partial<POSFilters>) {
  return useQuery({
    queryKey: ['pos-events', filters],
    queryFn: () => {
      const apiFilters = filters ? {
        categoryIds: filters.categories,
        tagIds: filters.tags,
        status: filters.status,
        activeOnly: filters.activeOnly,
        dateFrom: filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
        dateTo: filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined
      } : undefined
      
      return POSApiService.getEvents(apiFilters)
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })
}
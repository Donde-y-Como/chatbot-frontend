import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { OrdersService } from './OrdersService'
import { EditOrderRequest, OrdersFilters } from './types'

// Hook for unfiltered data (for stats)
export const useGetOrdersForStats = () => {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => OrdersService.getOrders(), // No filters for stats
    staleTime: 1000 * 60 * 15, // 15 minutes - stats can be cached longer
    refetchOnWindowFocus: true,
  })
}

// Hook for filtered data (for table)
export const useGetOrdersFiltered = (filters: OrdersFilters) => {
  return useQuery({
    queryKey: ['orders', 'filtered', filters],
    queryFn: () => OrdersService.getOrders(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  })
}

// Hook for deleting an order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => OrdersService.deleteOrder(orderId),
    onSuccess: () => {
      // Invalidate both stats and filtered queries to refresh the data
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// Hook for editing an order
export const useEditOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: EditOrderRequest) => OrdersService.editOrder(request),
    onSuccess: () => {
      // Invalidate both stats and filtered queries to refresh the data
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// Hook for getting a single order by ID
export const useGetOrder = (orderId: string | null) => {
  return useQuery({
    queryKey: ['orders', 'detail', orderId],
    queryFn: () => OrdersService.getOrder(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

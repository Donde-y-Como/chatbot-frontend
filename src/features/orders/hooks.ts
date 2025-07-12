import { useQuery } from "@tanstack/react-query"
import { OrdersService } from "./OrdersService"
import { OrdersFilters } from "./types"

export const useGetOrders = (filters?: OrdersFilters) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => OrdersService.getOrders(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for unfiltered data (for stats)
export const useGetOrdersForStats = () => {
  return useQuery({
    queryKey: ["orders", "stats"],
    queryFn: () => OrdersService.getOrders(), // No filters for stats
    staleTime: 1000 * 60 * 15, // 15 minutes - stats can be cached longer
  })
}

// Hook for filtered data (for table)
export const useGetOrdersFiltered = (filters: OrdersFilters) => {
  return useQuery({
    queryKey: ["orders", "filtered", filters],
    queryFn: () => OrdersService.getOrders(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Object.keys(filters).length > 0, // Only run when there are filters
  })
}
import { useQuery } from "@tanstack/react-query"
import { SalesService } from "./SalesService"
import { SalesFilters } from "./types"

export const useGetSales = (filters?: SalesFilters) => {
  return useQuery({
    queryKey: ["orders", "sales", filters], // Updated to reflect orders endpoint
    queryFn: () => SalesService.getSales(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for unfiltered data (for stats)
export const useGetSalesForStats = () => {
  return useQuery({
    queryKey: ["orders", "sales", "stats"], // Updated to reflect orders endpoint
    queryFn: () => SalesService.getSales(), // No filters for stats
    staleTime: 1000 * 60 * 15, // 15 minutes - stats can be cached longer
  })
}

// Hook for filtered data (for table)
export const useGetSalesFiltered = (filters: SalesFilters) => {
  return useQuery({
    queryKey: ["orders", "sales", "filtered", filters], // Updated to reflect orders endpoint
    queryFn: () => SalesService.getSales(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Object.keys(filters).length > 0, // Only run when there are filters
  })
}

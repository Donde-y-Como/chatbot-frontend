import { useQuery } from "@tanstack/react-query"
import { SalesService } from "./SalesService"
import { SalesFilters } from "./types"

export const useGetSales = (filters?: SalesFilters) => {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: () => SalesService.getSales(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

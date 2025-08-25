import { api } from '@/api/axiosInstance.ts'
import { SalesResponse, SalesFilters } from "./types"

export const SalesService = {
  getSales: async (filters?: SalesFilters): Promise<SalesResponse> => {
    const params = new URLSearchParams()
    
    if (filters?.clientId) params.append('clientId', filters.clientId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    // Using orders endpoint since sales are handled as completed orders in the backend
    const response = await api.get<SalesResponse>(`/orders?${params.toString()}`)
    return response.data
  }
}

import { api } from "../../../api/axiosInstance"
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

    const response = await api.get<SalesResponse>(`/sales?${params.toString()}`)
    return response.data
  }
}

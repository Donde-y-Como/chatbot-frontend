import { api } from '@/api/axiosInstance.ts'
import { OrderWithDetails } from '@/features/store/types'
import { EditOrderRequest, OrdersFilters, OrdersResponse } from './types'

export interface GetOrderResponse {
  success: boolean
  data: OrderWithDetails
}

export const OrdersService = {
  getOrders: async (filters?: OrdersFilters): Promise<OrdersResponse> => {
    const params = new URLSearchParams()

    if (filters?.status) params.append('status', filters.status)
    if (filters?.clientId) params.append('clientId', filters.clientId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.paymentMethod)
      params.append('paymentMethod', filters.paymentMethod)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    const response = await api.get<OrdersResponse>(
      `/orders?${params.toString()}`
    )
    return response.data
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    await api.delete(`/orders/${orderId}`)
  },

  editOrder: async (request: EditOrderRequest): Promise<void> => {
    const { orderId, ...body } = request
    await api.put(`/orders/${orderId}`, body)
  },

  getOrder: async (orderId: string): Promise<GetOrderResponse> => {
    const response = await api.get<GetOrderResponse>(`/orders/${orderId}`)
    return response.data
  },
}

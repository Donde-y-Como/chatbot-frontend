import { api } from '@/api/axiosInstance.ts'
import { GetOrderReceiptsResponse, GetReceiptResponse, SuperReceiptData } from '@/features/store/types'

export const ReceiptsService = {
  getOrderReceipts: async (orderId: string): Promise<GetOrderReceiptsResponse> => {
    const response = await api.get<GetOrderReceiptsResponse>(`/orders/${orderId}/receipts`)
    return response.data
  },

  getReceipt: async (receiptId: string): Promise<GetReceiptResponse> => {
    const response = await api.get<GetReceiptResponse>(`/receipts/${receiptId}`)
    return response.data
  },

  getOrderSuperReceipt: async (orderId: string): Promise<{ success: boolean; data: SuperReceiptData }> => {
    const response = await api.get<{ success: boolean; data: SuperReceiptData }>(`/orders/${orderId}/super-receipt`)
    return response.data
  },

  getSaleReceipt: async (saleId: string): Promise<{ success: boolean; data: SuperReceiptData }> => {
    const response = await api.get<{ success: boolean; data: SuperReceiptData }>(`/sales/${saleId}/receipt`)
    return response.data
  }
}
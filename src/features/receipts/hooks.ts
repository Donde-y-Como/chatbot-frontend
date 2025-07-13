import { useQuery } from '@tanstack/react-query'
import { ReceiptsService } from './ReceiptsService'

// Hook for getting all receipts for an order
export const useGetOrderReceipts = (orderId: string | null) => {
  return useQuery({
    queryKey: ['receipts', 'order', orderId],
    queryFn: () => ReceiptsService.getOrderReceipts(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for getting a specific receipt
export const useGetReceipt = (receiptId?: string | null) => {
  return useQuery({
    queryKey: ['receipts', 'detail', receiptId],
    queryFn: () => ReceiptsService.getReceipt(receiptId!),
    enabled: !!receiptId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for getting order super receipt
export const useGetOrderSuperReceipt = (orderId: string | null) => {
  return useQuery({
    queryKey: ['receipts', 'super', orderId],
    queryFn: () => ReceiptsService.getOrderSuperReceipt(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for getting sale receipt
export const useGetSaleReceipt = (saleId: string | null) => {
  return useQuery({
    queryKey: ['receipts', 'sale', saleId],
    queryFn: () => ReceiptsService.getSaleReceipt(saleId!),
    enabled: !!saleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
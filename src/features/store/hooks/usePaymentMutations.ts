import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { CART_QUERY_KEY } from '@/features/store/hooks/useCart.ts'
import {
  CartState,
  OrderWithDetails,
  PaymentMethod,
  Price,
  SalePrimitives,
  SaleWithDetails,
} from '../types'

interface ConvertToSaleData {
  cart: CartState
  paymentMethod: PaymentMethod
  amountToPay: number
  cashReceived: number
  changeAmount: number
}

interface ConvertToOrderData {
  cart: CartState
  paymentMethod: PaymentMethod
}

interface AddPaymentToOrderData {
  orderId: string
  paymentMethod: PaymentMethod
  amount: Price
  cashReceived: number
  changeAmount: number
}

const convertCartToSale = async (data: ConvertToSaleData) => {
  const response = await api.post<{ success: boolean; data: SalePrimitives }>(
    '/sales/convert-cart',
    {
      clientId: data.cart.selectedClientId,
      paymentMethod: data.paymentMethod,
    }
  )

  if (!response.data.success) {
    throw new Error('No se pudo crear la venta')
  }

  return response.data.data
}

const convertCartToOrder = async (data: ConvertToOrderData) => {
  const response = await api.post<{ success: boolean; data: OrderWithDetails }>(
    '/orders/convert-cart',
    {
      clientId: data.cart.selectedClientId,
    }
  )

  if (!response.data.success) {
    throw new Error('No se pudo crear la orden')
  }

  return response.data.data
}

const addPaymentToOrder = async (data: AddPaymentToOrderData) => {
  const response = await api.post<{
    success: boolean
    data: OrderWithDetails | SaleWithDetails
    type: 'sale' | 'order'
  }>(`/orders/${data.orderId}/payments`, {
    amount: data.amount,
    paymentMethod: data.paymentMethod,
  })

  if (response.data.type === 'sale') {
    return response.data.data as SaleWithDetails
  }

  return response.data.data as OrderWithDetails
}

// Mutation hooks
export const useConvertToSale = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: convertCartToSale,
    onSuccess: (data) => {
      toast.success('Venta guardada exitosamente')
      void queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({
        queryKey: ['clients', data.clientId, 'pendingServices'],
      })
    },
    onError: () => {
      toast.error('No se pudo guardar la venta, intenta mas tarde')
    },
  })
}

export const useConvertToOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: convertCartToOrder,
    onSuccess: (data) => {
      toast.success('Orden guardada exitosamente')
      void queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({
        queryKey: ['clients', data.clientId, 'pendingServices'],
      })
    },
    onError: () => {
      toast.error('No se pudo guardar la orden, intenta mas tarde')
    },
  })
}

export const useAddPaymentToOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addPaymentToOrder,
    onSuccess: () => {
      toast.success('Pago abonado exitosamente')
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => {
      toast.error('No se pudo abonar a la orden, intenta mas tarde')
    },
  })
}

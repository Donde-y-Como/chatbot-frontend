import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { CART_QUERY_KEY } from '@/features/store/hooks/useCart.ts'
import {
  CartItemWithDetails,
  CartState,
  OrderWithDetails,
  PaymentMethod,
  Price,
  SalePrimitives,
  SaleWithDetails,
} from '../types'

/**
 * Get or generate unique terminal ID for this POS browser instance
 */
const getTerminalId = (): string => {
  const STORAGE_KEY = 'pos_terminal_id';
  let terminalId = localStorage.getItem(STORAGE_KEY);

  if (!terminalId) {
    const location = import.meta.env.VITE_TERMINAL_LOCATION || 'default';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    terminalId = `terminal-${location}-${timestamp}-${random}`;
    localStorage.setItem(STORAGE_KEY, terminalId);
  }

  return terminalId;
};

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

interface EditOrderData {
  orderId: string
  items: CartItemWithDetails[]
  notes?: string
}

const convertCartToSale = async (data: ConvertToSaleData) => {
  // First convert cart to order, then add full payment to complete it as sale
  const orderResponse = await api.post<{ success: boolean; data: OrderWithDetails }>(
    '/orders/convert-cart',
    {
      terminalId: getTerminalId(),        // For cart lookup (which terminal's cart)
      clientId: data.cart.selectedClientId, // For order customer (who is buying)
    }
  )

  if (!orderResponse.data.success) {
    throw new Error('No se pudo crear la orden')
  }

  // Add full payment to convert order to sale
  const paymentResponse = await api.post<{
    success: boolean
    data: OrderWithDetails | SaleWithDetails
    type: 'sale' | 'order'
  }>(`/orders/${orderResponse.data.data.id}/payments`, {
    amount: data.cart.total,
    paymentMethod: data.paymentMethod,
  })

  if (!paymentResponse.data.success) {
    throw new Error('No se pudo procesar el pago')
  }

  return paymentResponse.data.data as SalePrimitives
}

const convertCartToOrder = async (data: ConvertToOrderData) => {
  const response = await api.post<{ success: boolean; data: OrderWithDetails }>(
    '/orders/convert-cart',
    {
      terminalId: getTerminalId(),        // For cart lookup (which terminal's cart)
      clientId: data.cart.selectedClientId, // For order customer (who is buying)
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

const DEFAULT_CURRENCY = 'MXN'

const editOrder = async (data: EditOrderData) => {
  const itemsPayload = data.items.map((item) => {
    // --- Sanitize eventMetadata: ensure selectedDate is full ISO 8601 datetime ---
    let eventMetadata = item.eventMetadata
    if (eventMetadata?.selectedDate) {
      const date = eventMetadata.selectedDate
      const isFullISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)
      eventMetadata = {
        ...eventMetadata,
        selectedDate: isFullISO ? date : `${date}T00:00:00.000Z`,
      }
    }

    // --- Fallbacks for fields that may be null at runtime despite TS types ---
    // Backend may return null for prices when catalog item is missing
    const currency = (item.unitPrice as any)?.currency
      ?? (item.finalPrice as any)?.currency
      ?? item.effectiveUnitPrice?.currency
      ?? DEFAULT_CURRENCY

    const unitPrice = (item.unitPrice as any) ?? item.effectiveUnitPrice ?? {
      amount: 0,
      currency,
    }
    const finalPrice = (item.finalPrice as any) ?? item.totalPrice ?? {
      amount: unitPrice.amount * item.quantity,
      currency,
    }

    // Name: primitives field → itemDetails.name → fallback
    const name = (item.itemName as any)
      ?? (item.itemDetails as any)?.name
      ?? 'Sin nombre'

    return {
      itemId: item.itemId,
      itemType: item.itemType,
      name,
      quantity: item.quantity,
      unitPrice,
      finalPrice,
      modifiedPrice: (item.modifiedPrice as any) ?? undefined,
      // Zod .optional() rechaza null — convertir null a undefined
      notes: item.notes ?? undefined,
      eventMetadata: eventMetadata ?? undefined,
    }
  })

  let response
  try {
    response = await api.put<{ success: boolean; message: string }>(

      `/orders/${data.orderId}`,
      {
        items: itemsPayload,
        notes: data.notes,
      }
    )
  } catch (err: any) {
    // Extract backend validation message from ProblemDetails or axios error
    const backendMessage =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      'No se pudo actualizar la orden'
    throw new Error(backendMessage)
  }

  if (!response.data.success) {
    throw new Error(response.data.message || 'No se pudo actualizar la orden')
  }

  return response.data
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
      void queryClient.invalidateQueries({
        queryKey: ['products'],
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

export const useEditOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: editOrder,
    onSuccess: () => {
      toast.success('Orden actualizada exitosamente')
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'No se pudo actualizar la orden, intenta mas tarde')
    },
  })
}

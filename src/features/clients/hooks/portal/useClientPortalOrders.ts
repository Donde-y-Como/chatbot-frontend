import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '@/api/axiosInstance'

export interface PortalService {
  id: string
  name: string
  description?: string
  duration: {
    value: number
    unit: 'minutes' | 'hours'
  }
  price: {
    amount: number
    currency: string
  }
  photos: string[]
  productInfo: {
    sku: string
    status: 'active' | 'inactive'
  }
}

export interface OrderItem {
  serviceId: string
  quantity: number
  notes?: string
}

export interface OrderRequest {
  items: OrderItem[]
  notes?: string
  clientForId?: string // For ordering on behalf of someone else
}

export interface OrderResponse {
  success: boolean
  orderId?: string
  message: string
}

export interface ClientOrder {
  id: string
  items: {
    serviceId: string
    serviceName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    notes?: string
  }[]
  totalAmount: number
  currency: string
  status: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada'
  paymentStatus: 'pendiente' | 'pagado' | 'parcial' | 'reembolsado'
  notes?: string
  createdAt: string
  clientForName?: string // Name of person the order was made for
}

const getPortalServices = async (clientId: string, token: string): Promise<PortalService[]> => {
  const response = await portalApi.get<{success: boolean, data: PortalService[], message: string}>(
    `/clients/portal/${clientId}/orderable-services`,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener servicios disponibles')
  }

  return response.data.data
}

const getOrderHistory = async (clientId: string, token: string): Promise<ClientOrder[]> => {
  const response = await portalApi.get<{success: boolean, data: ClientOrder[], message: string}>(
    `/clients/portal/${clientId}/orders`,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener historial de órdenes')
  }

  return response.data.data
}

const createOrder = async (
  clientId: string,
  token: string,
  order: OrderRequest
): Promise<OrderResponse> => {
  const response = await portalApi.post<OrderResponse>(
    `/clients/portal/${clientId}/create-order`,
    order,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  return response.data
}

export function useClientPortalOrderableServices(clientId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-orderable-services', clientId, token],
    queryFn: () => getPortalServices(clientId, token),
    enabled: enabled && !!clientId && !!token,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  })
}

export function useClientPortalOrderHistory(clientId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-orders', clientId, token],
    queryFn: () => getOrderHistory(clientId, token),
    enabled: enabled && !!clientId && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useClientPortalCreateOrder(clientId: string, token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (order: OrderRequest) => createOrder(clientId, token, order),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-portal-orders', clientId] })
    },
  })
}
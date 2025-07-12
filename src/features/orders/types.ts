import { z } from "zod"
import { OrderWithDetails, OrderStatus, PaymentMethod, OrderItemPrimitives, CartItemType } from "@/features/store/types"

export interface OrdersResponse {
  success: boolean
  data: OrderWithDetails[]
  count: number
}

export interface OrdersFilters {
  status?: OrderStatus
  clientId?: string
  startDate?: string
  endDate?: string
  paymentMethod?: PaymentMethod
  limit?: number
  offset?: number
}

export const ordersFiltersSchema = z.object({
  status: z.enum(['pending', 'partial_paid', 'paid', 'cancelled']).optional(),
  clientId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'cash']).optional(),
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional()
})

export type OrdersFiltersForm = z.infer<typeof ordersFiltersSchema>

// Edit Order Types - reusing existing types from store/types.ts
export interface EditOrderRequest {
  orderId: string
  items?: OrderItemPrimitives[]
  status?: OrderStatus
  notes?: string
}

// For the edit form, we can reuse OrderItemPrimitives but add validation
const OrderItemSchema = z.object({
  itemId: z.string().min(1, "Item ID es requerido"),
  itemType: z.nativeEnum({
    product: 'product',
    service: 'service', 
    event: 'event',
    bundle: 'bundle'
  } satisfies Record<CartItemType, CartItemType>, {
    errorMap: () => ({message: "Tipo de item inválido"})
  }),
  name: z.string().min(1, "Nombre es requerido"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.object({
    amount: z.number().min(0, "El precio unitario debe ser mayor o igual a 0"),
    currency: z.string().min(1, "Currency es requerida")
  }),
  finalPrice: z.object({
    amount: z.number().min(0, "El precio final debe ser mayor o igual a 0"),
    currency: z.string().min(1, "Currency es requerida")
  }),
  modifiedPrice: z.object({
    amount: z.number().min(0, "El precio modificado debe ser mayor o igual a 0"),
    currency: z.string().min(1, "Currency es requerida")
  }).optional(),
  notes: z.string().optional(),
  eventMetadata: z.object({
    selectedDate: z.string().datetime(),
    provisionalBookingId: z.string()
  }).optional()
})

export const EditOrderRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID es requerido"),
  items: z.array(OrderItemSchema).optional(),
  status: z.nativeEnum({
    pending: 'pending',
    partial_paid: 'partial_paid',
    paid: 'paid', 
    cancelled: 'cancelled'
  } satisfies Record<OrderStatus, OrderStatus>, {
    errorMap: () => ({message: "Estado de orden inválido"})
  }).optional(),
  notes: z.string().optional()
})

export type EditOrderFormData = z.infer<typeof EditOrderRequestSchema>
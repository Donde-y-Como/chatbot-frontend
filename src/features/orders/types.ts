import { z } from "zod"
import { OrderWithDetails, OrderStatus, PaymentMethod } from "@/features/store/types"

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
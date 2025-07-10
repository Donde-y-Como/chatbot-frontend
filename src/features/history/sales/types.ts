import { z } from "zod"

export enum PaymentMethod {
  EFECTIVO = "EFECTIVO",
  TARJETA = "TARJETA",
  TRANSFERENCIA = "TRANSFERENCIA",
  CHEQUE = "CHEQUE"
}

export interface Price {
  amount: number
  currency: string
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: Price
  totalPrice: Price
}

export interface Payment {
  id: string
  amount: Price
  method: PaymentMethod
  notes?: string
  createdAt: string
}

export interface Sale {
  id: string
  businessId: string
  clientId: string
  items: OrderItem[]
  payments: Payment[]
  notes?: string
  createdAt: string
  totalAmount: Price
  totalPaidAmount: Price
  itemCount: number
  paymentSummary: { [key in PaymentMethod]?: Price }
}

export interface SalesResponse {
  success: boolean
  data: Sale[]
  count: number
  message: string
}

export interface SalesFilters {
  clientId?: string
  startDate?: string
  endDate?: string
  paymentMethod?: PaymentMethod
  limit?: number
  offset?: number
}

export const salesFiltersSchema = z.object({
  clientId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional()
})

export type SalesFiltersForm = z.infer<typeof salesFiltersSchema>

import { Bundle } from '@/features/bundles/types.ts'
import { Media } from '@/features/chats/ChatTypes.ts'
import { Service } from '../appointments/types'
import { EventPrimitives } from '../events/types'
import { Product, ProductStatus } from '../products/types'

export type AddCartItemResponse = {
  success: boolean
  message: string
  data?: CartPrimitives
}

export type ProblemDetails = {
  title: string
  detail: string
}

// Categorías disponibles en el POS
export type POSCategory =
  | 'TODOS'
  | 'PRODUCTOS'
  | 'PAQUETES'
  | 'SERVICIOS'
  | 'EVENTOS'

// Precio unificado para todos los tipos de items
export interface Price {
  amount: number
  currency: string
}

export interface CartItemRequest {
  itemId: string
  itemType: CartItemType
  quantity: number
  notes?: string
  eventDate?: string
}

export interface UpdateCartItemPriceRequest {
  itemType: CartItemType
  itemId: string
  newPrice: {
    amount: number
    currency: string
  }
}

export type UpdateCartItemQuantityRequest = CartItemRequest & {}

// Cart API Response Types
export type CartItemType = 'product' | 'service' | 'event' | 'bundle'

export type EventMetadata = {
  selectedDate: string
  provisionalBookingId: string
}

export type CartItemPrimitives = {
  itemId: string
  itemType: CartItemType
  itemName: string
  quantity: number
  unitPrice: Price
  finalPrice: Price
  modifiedPrice?: Price
  notes?: string
  eventMetadata?: EventMetadata
  addedAt: string
}

export interface ItemDetailData {
  id: string
  name: string
  description: string
  photos?: string[]
  files?: Media[]

  [key: string]: any // For additional properties specific to each item type
}

export type CartItemWithDetails = CartItemPrimitives & {
  itemDetails: ItemDetailData | null
  totalPrice: Price
  effectiveUnitPrice: Price
  hasPriceModification: boolean
}

export type CartPrimitives = {
  id: string
  businessId: string
  items: CartItemPrimitives[]
  createdAt: string
  updatedAt: string
}

export type CartWithDetails = CartPrimitives & {
  itemsWithDetails: CartItemWithDetails[]
  totalAmount: Price
  itemCount: number
}

export interface BasicCartData
  extends Omit<CartWithDetails, 'itemsWithDetails'> {}

export type CartResponseData = BasicCartData | CartWithDetails

export interface GetCartSuccessResponse {
  success: true
  data: CartResponseData | null
  message: string
}

// Item base para el carrito
export type POSItem = {
  type: CartItemType
  itemDetails: Product | Service | EventPrimitives | Bundle
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash'

// Rango de fechas
export interface DateRange {
  from: Date | null
  to: Date | null
}

// Configuración de filtros
export interface POSFilters {
  search: string
  category: POSCategory
  priceRange?: {
    min?: number
    max?: number
  }
  tags?: string[]
  categories?: string[]
  subcategories?: string[]
  units?: string[]
  unidadMedida?: string[]
  status?: ProductStatus
  activeOnly?: boolean
  dateRange?: DateRange
  isActive: boolean
}

// Estado del carrito
export interface CartState {
  isOpen: boolean
  items: CartItemWithDetails[]
  selectedClientId: string
  total: Price
}

// Datos auxiliares para filtros
export interface AuxiliaryData {
  tags: Array<{ id: string; name: string; color?: string }>
  categories: Array<{ id: string; name: string }>
  subcategories: Array<{ id: string; name: string; categoryId?: string }>
  units: Array<{ id: string; name: string; abbreviation: string }>
  unidadesMedida: Array<{ id: string; name: string; abbreviation: string }>
  statuses: Array<{ id: string; name: string }>
}

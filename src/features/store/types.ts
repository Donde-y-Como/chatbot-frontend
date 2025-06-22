import { Product } from '../products/types'
import { Service } from '../services/types'
import { EventPrimitives } from '../events/types'

// Categorías disponibles en el POS
export type POSCategory = 'TODOS' | 'PRODUCTOS' | 'PAQUETES' | 'SERVICIOS' | 'EVENTOS'

// Precio unificado para todos los tipos de items
export interface POSPrice {
  amount: number
  currency: string
}

// Item base para el carrito
export interface POSItem {
  id: string
  type: POSCategory
  name: string
  price: POSPrice
  image?: string
  quantity: number
  originalData: Product | Service | EventPrimitives | null
}

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
  status?: string
  activeOnly?: boolean
  dateRange?: DateRange
  isActive: boolean
}

// Estado del carrito
export interface CartState {
  isOpen: boolean
  items: POSItem[]
  selectedClientId: string
  subtotal: POSPrice
  taxes: POSPrice
  total: POSPrice
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

// Estado principal del POS
export interface POSState {
  // Datos
  products: Product[]
  services: Service[]
  events: EventPrimitives[]
  auxiliaryData: AuxiliaryData
  
  // UI State
  isLoading: boolean
  filters: POSFilters
  cart: CartState
  
  // Acciones
  setProducts: (products: Product[]) => void
  setServices: (services: Service[]) => void
  setEvents: (events: EventPrimitives[]) => void
  setAuxiliaryData: (data: AuxiliaryData) => void
  setIsLoading: (loading: boolean) => void
  updateFilters: (filters: Partial<POSFilters>) => void
  
  // Carrito
  addToCart: (item: Omit<POSItem, 'quantity'>) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setSelectedClient: (clientId: string) => void
}

// Utilidad para convertir productos a POSItem
export const productToPOSItem = (product: Product): Omit<POSItem, 'quantity'> => ({
  id: product.id,
  type: 'PRODUCTOS',
  name: product.name,
  price: product.finalPrice || product.price,
  image: product.photos?.[0],
  originalData: product
})

// Utilidad para convertir servicios a POSItem
export const serviceToPOSItem = (service: Service): Omit<POSItem, 'quantity'> => ({
  id: service.id,
  type: 'SERVICIOS',
  name: service.name,
  price: service.productInfo?.precioModificado || service.price,
  image: service.photos?.[0],
  originalData: service
})

// Utilidad para convertir eventos a POSItem
export const eventToPOSItem = (event: EventPrimitives): Omit<POSItem, 'quantity'> => ({
  id: event.id,
  type: 'EVENTOS',
  name: event.name,
  price: event.productInfo?.precioModificado || event.price,
  image: event.photos?.[0],
  originalData: event
})
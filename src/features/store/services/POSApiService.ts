import { api } from '../../../api/axiosInstance.ts'
import { Product } from '../../products/types'
import { Service } from '../../services/types'
import { EventPrimitives } from '../../events/types'
import { Bundle } from '../types'

interface CartItem {
  itemId: string
  itemType: 'product' | 'service' | 'event' | 'bundle'
  quantity: number
  notes?: string
  reservationId?: string
}

interface CartItemUpdate {
  itemType: 'product' | 'service' | 'event' | 'bundle'
  quantity?: number
  newPrice?: {
    amount: number
    currency: string
  }
}

interface POSInitializeResponse {
  data: {
    cart: any
    hasActiveCart: boolean
  }
  message: string
  success: boolean
}

export const POSApiService = {
  getProducts: async (filters?: {
    categoryIds?: string[]
    tagIds?: string[]
    status?: string
    unitIds?: string[]
  }): Promise<Product[]> => {
    let url = '/products/item'
    const params = new URLSearchParams()
    
    if (filters?.categoryIds?.length) {
      params.append('categoryIds', filters.categoryIds.join(','))
    }
    if (filters?.tagIds?.length) {
      params.append('tagIds', filters.tagIds.join(','))
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.unitIds?.length) {
      params.append('unitIds', filters.unitIds.join(','))
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const response = await api.get(url)
    if (response.status !== 200) {
      throw new Error('Error obteniendo productos')
    }
    return response.data.products || response.data
  },

  getServices: async (filters?: {
    categoryIds?: string[]
    tagIds?: string[]
    status?: string
    unidadMedida?: string[]
  }): Promise<Service[]> => {
    let url = '/services'
    const params = new URLSearchParams()
    
    if (filters?.categoryIds?.length) {
      params.append('categoryIds', filters.categoryIds.join(','))
    }
    if (filters?.tagIds?.length) {
      params.append('tagIds', filters.tagIds.join(','))
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.unidadMedida?.length) {
      params.append('unidadMedida', filters.unidadMedida.join(','))
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const response = await api.get(url)
    if (response.status !== 200) {
      throw new Error('Error obteniendo servicios')
    }
    return response.data.services || response.data
  },

  getEvents: async (filters?: {
    categoryIds?: string[]
    tagIds?: string[]
    status?: string
    activeOnly?: boolean
    dateFrom?: string
    dateTo?: string
  }): Promise<EventPrimitives[]> => {
    let url = '/events'
    const params = new URLSearchParams()
    
    if (filters?.categoryIds?.length) {
      params.append('categoryIds', filters.categoryIds.join(','))
    }
    if (filters?.tagIds?.length) {
      params.append('tagIds', filters.tagIds.join(','))
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.activeOnly !== undefined) {
      params.append('activeOnly', filters.activeOnly.toString())
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom)
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo)
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const response = await api.get(url)
    if (response.status !== 200) {
      throw new Error('Error obteniendo eventos')
    }
    return response.data
  },

  getProductTags: async (): Promise<Array<{ id: string; name: string; color?: string }>> => {
    const response = await api.get('/products/productTags')
    if (response.status !== 200) {
      throw new Error('Error obteniendo etiquetas')
    }
    return response.data
  },

  getCategories: async (): Promise<Array<{ id: string; name: string }>> => {
    const response = await api.get('/products/categories')
    if (response.status !== 200) {
      throw new Error('Error obteniendo categorías')
    }
    return response.data
  },

  getUnits: async (): Promise<Array<{ id: string; name: string; abbreviation: string }>> => {
    const response = await api.get('/products/units')
    if (response.status !== 200) {
      throw new Error('Error obteniendo unidades')
    }
    return response.data
  },

  processSale: async (saleData: {
    clientId: string
    items: Array<{
      id: string
      type: 'PRODUCTO' | 'SERVICIO' | 'EVENTO'
      quantity: number
      price: number
    }>
    subtotal: number
    taxes: number
    total: number
  }) => {
    const response = await api.post('/sales', saleData)
    if (response.status !== 201) {
      throw new Error('Error procesando venta')
    }
    return response.data
  },

  getBundles: async (filters?: {
    tagIds?: string[]
    status?: string
  }): Promise<Bundle[]> => {
    let url = '/bundles/'
    const params = new URLSearchParams()
    
    if (filters?.tagIds?.length) {
      params.append('tagIds', filters.tagIds.join(','))
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const response = await api.get(url)
    if (response.status !== 200) {
      throw new Error('Error obteniendo paquetes')
    }
    return response.data.bundles || response.data
  },

  getBundleById: async (bundleId: string): Promise<Bundle> => {
    const response = await api.get(`/bundles/${bundleId}`)
    if (response.status !== 200) {
      throw new Error('Error obteniendo paquete')
    }
    return response.data
  },

  getTagById: async (tagId: string): Promise<{ id: string; name: string; color?: string }> => {
    const response = await api.get(`/products/productTags/${tagId}`)
    if (response.status !== 200) {
      throw new Error('Error obteniendo etiqueta')
    }
    return response.data
  },

  getProductById: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/item/${productId}`)
    if (response.status !== 200) {
      throw new Error('Error obteniendo producto')
    }
    return response.data
  },

  getServiceById: async (serviceId: string): Promise<Service> => {
    const response = await api.get(`/services/${serviceId}`)
    if (response.status !== 200) {
      throw new Error('Error obteniendo servicio')
    }
    return response.data
  },

  getEventById: async (eventId: string): Promise<EventPrimitives> => {
    const response = await api.get(`/events/${eventId}`)
    if (response.status !== 200) {
      throw new Error('Error obteniendo evento')
    }
    return response.data
  },

  getItemNameById: async (itemId: string, itemType: 'product' | 'service' | 'event' | 'bundle'): Promise<string> => {
    try {
      switch (itemType) {
        case 'product': {
          const product = await api.get(`/products/item/${itemId}`)
          if (product.status !== 200) throw new Error('Error obteniendo producto')
          return product.data.name
        }
        case 'service': {
          const service = await api.get(`/services/${itemId}`)
          if (service.status !== 200) throw new Error('Error obteniendo servicio')
          return service.data.name
        }
        case 'event': {
          const event = await api.get(`/events/${itemId}`)
          if (event.status !== 200) throw new Error('Error obteniendo evento')
          return event.data.name
        }
        case 'bundle': {
          const bundle = await api.get(`/bundles/${itemId}`)
          if (bundle.status !== 200) throw new Error('Error obteniendo paquete')
          return bundle.data.name
        }
        default:
          return 'Item desconocido'
      }
    } catch (error) {
      console.error(`Error obteniendo nombre para ${itemType} ${itemId}:`, error)
      return 'Error al cargar nombre'
    }
  },

  getMultipleItemNames: async (items: Array<{ itemId: string; itemType: 'product' | 'service' | 'event' | 'bundle' }>): Promise<Record<string, string>> => {
    const namePromises = items.map(async (item) => {
      const name = await POSApiService.getItemNameById(item.itemId, item.itemType)
      return { id: item.itemId, name }
    })
    
    const results = await Promise.allSettled(namePromises)
    const nameMap: Record<string, string> = {}
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        nameMap[result.value.id] = result.value.name
      } else {
        nameMap[items[index].itemId] = 'Error al cargar'
      }
    })
    
    return nameMap
  },

  searchAll: async (query: string): Promise<{
    products: Product[]
    services: Service[]
    events: EventPrimitives[]
    bundles: Bundle[]
  }> => {
    try {
      const response = await api.get(`/pos/search?q=${encodeURIComponent(query)}`)
      if (response.status !== 200) {
        throw new Error('Error en búsqueda unificada')
      }
      return response.data
    } catch (error) {
      console.warn('Endpoint de búsqueda unificada no disponible, usando búsquedas separadas')
      
      const [products, services, events, bundles] = await Promise.allSettled([
        api.get(`/products/item?search=${encodeURIComponent(query)}`),
        api.get(`/services?search=${encodeURIComponent(query)}`),
        api.get(`/events?search=${encodeURIComponent(query)}`),
        api.get(`/bundles/?search=${encodeURIComponent(query)}`)
      ])

      return {
        products: products.status === 'fulfilled' ? (products.value.data.products || products.value.data || []) : [],
        services: services.status === 'fulfilled' ? (services.value.data || []) : [],
        events: events.status === 'fulfilled' ? (events.value.data || []) : [],
        bundles: bundles.status === 'fulfilled' ? (bundles.value.data.bundles || bundles.value.data || []) : []
      }
    }
  },

  posInitialize: async (): Promise<POSInitializeResponse> => {
    const response = await api.get('/pos/initialize')
    if (response.status !== 200) {
      throw new Error('Error inicializando POS')
    }
    return response.data
  },

  getCart: async () => {
    const response = await api.get('/cart')
    if (response.status !== 200) {
      throw new Error('Error obteniendo carrito')
    }
    return response.data
  },

  addToCart: async (item: CartItem) => {
    const response = await api.post('/cart/items', item)
    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Error agregando item al carrito')
    }
    return response.data
  },

  updateCartQuantity: async (itemId: string, update: CartItemUpdate) => {
    const response = await api.put(`/cart/items/${itemId}/quantity`, update)
    if (response.status !== 200) {
      throw new Error('Error actualizando cantidad')
    }
    return response.data
  },

  updateCartPrice: async (itemId: string, update: CartItemUpdate) => {
    const response = await api.put(`/cart/items/${itemId}/price`, update)
    if (response.status !== 200) {
      throw new Error('Error actualizando precio')
    }
    return response.data
  },

  removeFromCart: async (itemId: string, itemType: string) => {
    const response = await api.delete(`/cart/items/${itemId}`, {
      data: { itemType }
    })
    if (response.status !== 200 && response.status !== 204) {
      throw new Error('Error removiendo item del carrito')
    }
    return response.data
  },

  clearCart: async () => {
    const response = await api.delete('/cart')
    if (response.status !== 200 && response.status !== 204) {
      throw new Error('Error limpiando carrito')
    }
    return response.data
  }
}
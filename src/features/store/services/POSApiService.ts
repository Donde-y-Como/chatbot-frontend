import { api } from '../../../api/axiosInstance.ts'
import { Product } from '../../products/types'
import { Service } from '../../services/types'
import { EventPrimitives } from '../../events/types'

export const POSApiService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products/item')
    if (response.status !== 200) {
      throw new Error('Error obteniendo productos')
    }
    return response.data.products || response.data
  },

  getServices: async (): Promise<Service[]> => {
    const response = await api.get('/services')
    if (response.status !== 200) {
      throw new Error('Error obteniendo servicios')
    }
    return response.data
  },

  getEvents: async (): Promise<EventPrimitives[]> => {
    const response = await api.get('/events')
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

  searchAll: async (query: string): Promise<{
    products: Product[]
    services: Service[]
    events: EventPrimitives[]
  }> => {
    try {
      const response = await api.get(`/pos/search?q=${encodeURIComponent(query)}`)
      if (response.status !== 200) {
        throw new Error('Error en búsqueda unificada')
      }
      return response.data
    } catch (error) {
      console.warn('Endpoint de búsqueda unificada no disponible, usando búsquedas separadas')
      
      const [products, services, events] = await Promise.allSettled([
        api.get(`/products/item?search=${encodeURIComponent(query)}`),
        api.get(`/services?search=${encodeURIComponent(query)}`),
        api.get(`/events?search=${encodeURIComponent(query)}`)
      ])

      return {
        products: products.status === 'fulfilled' ? (products.value.data.products || products.value.data || []) : [],
        services: services.status === 'fulfilled' ? (services.value.data || []) : [],
        events: events.status === 'fulfilled' ? (events.value.data || []) : []
      }
    }
  }
}
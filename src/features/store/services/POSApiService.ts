import { api } from '../../../api/axiosInstance.ts'
import { Product } from '../../products/types'
import { Service } from '../../services/types'
import { EventPrimitives } from '../../events/types'
import { Bundle } from '../types'

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
  }
}
import { useState, useCallback, useMemo } from 'react'
import { POSFilters, POSCategory, POSItem, Bundle } from '../types'
import { Product, ProductStatus as ProductsProductStatus } from '../../products/types'
import { Service } from '../../services/types'
import { EventPrimitives } from '../../events/types'
import { ProductStatus as GlobalProductStatus } from '../../../types/global'
import { productToPOSItem, serviceToPOSItem, eventToPOSItem, bundleToPOSItem } from '../types'
import { format } from 'date-fns'

const mapStatusForComparison = (filterStatus: ProductsProductStatus | GlobalProductStatus, itemType: POSCategory) => {
  if (itemType === 'PRODUCTOS') {
    return filterStatus
  }
  if (itemType === 'PAQUETES') {
    switch (filterStatus) {
      case ProductsProductStatus.ACTIVO:
        return 'ACTIVO'
      case ProductsProductStatus.INACTIVO:
        return 'INACTIVO'
      default:
        return filterStatus
    }
  }
  // Si es servicios o eventos, mapear de products a global format
  if (itemType === 'SERVICIOS' || itemType === 'EVENTOS') {
    switch (filterStatus) {
      case ProductsProductStatus.ACTIVO:
        return GlobalProductStatus.ACTIVE
      case ProductsProductStatus.INACTIVO:
        return GlobalProductStatus.INACTIVE
      case ProductsProductStatus.SIN_STOCK:
        return null // Los servicios no tienen "sin stock"
      default:
        return filterStatus
    }
  }
  
  return null
}

const DEFAULT_FILTERS: POSFilters = {
  search: '',
  category: 'TODOS',
  priceRange: undefined,
  tags: undefined,
  categories: undefined,
  subcategories: undefined,
  units: undefined,
  unidadMedida: undefined,
  status: undefined,
  activeOnly: undefined,
  dateRange: undefined,
  isActive: false
}

interface UsePOSFiltersProps {
  products: Product[]
  services: Service[]
  events: EventPrimitives[]
  bundles: Bundle[]
}

export function usePOSFilters({ products, services, events, bundles }: UsePOSFiltersProps) {
  const [filters, setFilters] = useState<POSFilters>(DEFAULT_FILTERS)

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<POSFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Cambiar categoría
  const setCategory = useCallback((category: POSCategory) => {
    setFilters(prev => ({ ...prev, category }))
  }, [])

  // Actualizar búsqueda
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  // Toggle filtros activos
  const toggleFiltersActive = useCallback(() => {
    setFilters(prev => ({ ...prev, isActive: !prev.isActive }))
  }, [])

  // Convertir datos a POSItems y filtrar
  const filteredItems = useMemo(() => {
    let allItems: POSItem[] = []

    // Agregar productos según categoría seleccionada
    if (filters.category === 'TODOS' || filters.category === 'PRODUCTOS') {
      const productItems = products.map(product => ({
        ...productToPOSItem(product),
        quantity: 1
      }))
      allItems.push(...productItems)
    }

    // Agregar servicios según categoría seleccionada
    if (filters.category === 'TODOS' || filters.category === 'SERVICIOS') {
      const serviceItems = services.map(service => ({
        ...serviceToPOSItem(service),
        quantity: 1
      }))
      allItems.push(...serviceItems)
    }

    // Agregar eventos según categoría seleccionada
    if (filters.category === 'TODOS' || filters.category === 'EVENTOS') {
      const eventItems = events.map(event => ({
        ...eventToPOSItem(event),
        quantity: 1
      }))
      allItems.push(...eventItems)
    }

    // Agregar paquetes según categoría seleccionada
    if (filters.category === 'TODOS' || filters.category === 'PAQUETES') {
      const bundleItems = bundles.map(bundle => ({
        ...bundleToPOSItem(bundle),
        quantity: 1
      }))
      allItems.push(...bundleItems)
    }

    // Eliminar duplicados basados en ID
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    )
    
    allItems = uniqueItems

    // Filtrar por búsqueda (nombre, SKU y código de barras)
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      allItems = allItems.filter(item => {
        // Búsqueda por nombre
        const nameMatch = item.name.toLowerCase().includes(searchTerm)
        
        // Búsqueda por SKU
        let skuMatch = false
        if (item.originalData) {
          if (item.type === 'PRODUCTOS' && 'sku' in item.originalData) {
            skuMatch = item.originalData.sku.toLowerCase().includes(searchTerm)
          } else if (item.type === 'SERVICIOS' && 'productInfo' in item.originalData && item.originalData.productInfo?.sku) {
            skuMatch = item.originalData.productInfo.sku.toLowerCase().includes(searchTerm)
          } else if (item.type === 'EVENTOS' && 'productInfo' in item.originalData && item.originalData.productInfo?.sku) {
            skuMatch = item.originalData.productInfo.sku.toLowerCase().includes(searchTerm)
          } else if (item.type === 'PAQUETES' && 'sku' in item.originalData) {
            skuMatch = item.originalData.sku.toLowerCase().includes(searchTerm)
          }
        }
        
        // Búsqueda por código de barras
        let barcodeMatch = false
        if (item.originalData) {
          if (item.type === 'PRODUCTOS' && 'barcode' in item.originalData && item.originalData.barcode) {
            barcodeMatch = item.originalData.barcode.toLowerCase().includes(searchTerm)
          } else if (item.type === 'SERVICIOS' && 'codigoBarras' in item.originalData && item.originalData.codigoBarras) {
            barcodeMatch = item.originalData.codigoBarras.toString().includes(searchTerm)
          }
        }
        
        return nameMatch || skuMatch || barcodeMatch
      })
    }

    // Aquí se pueden agregar más filtros cuando filters.isActive sea true
    // Por ejemplo: filtros por precio, tags, categorías específicas, etc.
    if (filters.isActive) {
      // Aplicar filtros adicionales cuando estén implementados
      if (filters.priceRange && (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined)) {
        allItems = allItems.filter(item => {
          const price = item.price.amount
          const minPrice = filters.priceRange?.min
          const maxPrice = filters.priceRange?.max
          
          const meetsMin = minPrice === undefined || price >= minPrice
          const meetsMax = maxPrice === undefined || price <= maxPrice
          
          return meetsMin && meetsMax
        })
      }

      // Filtrar por tags
      if (filters.tags && filters.tags.length > 0) {
        allItems = allItems.filter(item => {
          if (!item.originalData) return false
          
          let itemTags: string[] = []
          if (item.type === 'PAQUETES' && 'tagIds' in item.originalData && item.originalData.tagIds) {
            itemTags = item.originalData.tagIds
          }
          else if ('productInfo' in item.originalData && item.originalData.productInfo?.tagIds) {
            itemTags = item.originalData.productInfo.tagIds
          } else if ('tagIds' in item.originalData && item.originalData.tagIds) {
            itemTags = item.originalData.tagIds
          }
          
          return filters.tags!.some(tagId => itemTags.includes(tagId))
        })
      }

      // Filtrar por categorías
      if (filters.categories && filters.categories.length > 0) {
        allItems = allItems.filter(item => {
          if (!item.originalData) return false
          
          let itemCategories: string[] = []
          if ('productInfo' in item.originalData && item.originalData.productInfo?.categoryIds) {
            itemCategories = item.originalData.productInfo.categoryIds
          } else if ('categoryIds' in item.originalData && item.originalData.categoryIds) {
            itemCategories = item.originalData.categoryIds
          }
          
          return filters.categories!.some(categoryId => itemCategories.includes(categoryId))
        })
      }

      // Filtrar por subcategorías
      if (filters.subcategories && filters.subcategories.length > 0) {
        allItems = allItems.filter(item => {
          if (!item.originalData) return false
          
          let itemSubcategories: string[] = []
          if ('productInfo' in item.originalData && item.originalData.productInfo?.subcategoryIds) {
            itemSubcategories = item.originalData.productInfo.subcategoryIds
          } else if ('subcategoryIds' in item.originalData && item.originalData.subcategoryIds) {
            itemSubcategories = item.originalData.subcategoryIds
          }
          
          return filters.subcategories!.some(subcategoryId => itemSubcategories.includes(subcategoryId))
        })
      }

      // Filtrar por unidades (productos)
      if (filters.units && filters.units.length > 0) {
        allItems = allItems.filter(item => {
          if (!item.originalData || item.type !== 'PRODUCTOS') return false
          
          const product = item.originalData as Product
          return product.unitId && filters.units!.includes(product.unitId)
        })
      }

      // Filtrar por estado
      if (filters.status) {
        const beforeCount = allItems.length
        
        allItems = allItems.filter(item => {
          if (!item.originalData) return false
          
          let itemStatus: string | undefined
          const expectedStatus = mapStatusForComparison(filters.status!, item.type)
          
          if (expectedStatus === null) {
            return false
          }
          
          if (item.type === 'PRODUCTOS' && 'status' in item.originalData) {
            itemStatus = item.originalData.status
          }
          else if (item.type === 'PAQUETES' && 'status' in item.originalData) {
            itemStatus = item.originalData.status
          }
          else if (item.type === 'SERVICIOS' && 'productInfo' in item.originalData && item.originalData.productInfo?.status) {
            itemStatus = item.originalData.productInfo.status
          }
          else if (item.type === 'EVENTOS' && 'productInfo' in item.originalData && item.originalData.productInfo?.status) {
            itemStatus = item.originalData.productInfo.status
          }
          else if ('status' in item.originalData && item.originalData.status) {
            itemStatus = item.originalData.status
          }
          
          const matches = itemStatus === expectedStatus
          
          return matches
        })
      }

      // Filtrar eventos por activeOnly
      if (filters.activeOnly !== undefined) {
        allItems = allItems.filter(item => {
          if (item.type !== 'EVENTOS') return true
          
          // Lógica para determinar si un evento está activo
          const event = item.originalData as EventPrimitives
          if (!event || !event.duration) return false
          
          const now = new Date()
          const eventStart = new Date(event.duration.startAt)
          
          return filters.activeOnly ? eventStart > now : true
        })
      }

      // Filtrar por rango de fechas (solo eventos)
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
        allItems = allItems.filter(item => {
          if (item.type !== 'EVENTOS') return true
          
          const event = item.originalData as EventPrimitives
          if (!event || !event.duration) return false
          
          const eventDate = new Date(event.duration.startAt)
          
          const meetsFrom = !filters.dateRange!.from || eventDate >= filters.dateRange!.from
          const meetsTo = !filters.dateRange!.to || eventDate <= filters.dateRange!.to
          
          return meetsFrom && meetsTo
        })
      }
    }

    return allItems
  }, [products, services, events, bundles, filters])

  // Estadísticas de filtros
  const filterStats = useMemo(() => {
    const totalProducts = products.length
    const totalServices = services.length
    const totalEvents = events.length
    const totalBundles = bundles.length
    const totalItems = totalProducts + totalServices + totalEvents + totalBundles
    const filteredCount = filteredItems.length

    return {
      total: totalItems,
      filtered: filteredCount,
      products: totalProducts,
      services: totalServices,
      events: totalEvents,
      bundles: totalBundles,
      isFiltered: filteredCount < totalItems
    }
  }, [products.length, services.length, events.length, bundles.length, filteredItems.length])

  return {
    // Estado
    filters,
    filteredItems,
    filterStats,

    // Acciones
    updateFilters,
    resetFilters,
    setCategory,
    setSearch,
    toggleFiltersActive
  }
}
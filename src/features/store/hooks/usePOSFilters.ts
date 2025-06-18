import { useState, useCallback, useMemo } from 'react'
import { POSFilters, POSCategory, POSItem } from '../types'
import { Product } from '../../products/types'
import { Service } from '../../services/types'
import { EventPrimitives } from '../../events/types'
import { productToPOSItem, serviceToPOSItem, eventToPOSItem } from '../types'

const DEFAULT_FILTERS: POSFilters = {
  search: '',
  category: 'TODOS',
  priceRange: undefined,
  tags: undefined,
  categories: undefined,
  units: undefined,
  isActive: false
}

interface UsePOSFiltersProps {
  products: Product[]
  services: Service[]
  events: EventPrimitives[]
}

export function usePOSFilters({ products, services, events }: UsePOSFiltersProps) {
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

    // Filtrar por búsqueda
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      )
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

      if (filters.tags && filters.tags.length > 0) {
        // Filtrar por tags cuando la lógica esté implementada
        // Necesitaría acceso a los tags de cada item
      }

      if (filters.categories && filters.categories.length > 0) {
        // Filtrar por categorías específicas cuando la lógica esté implementada
      }

      if (filters.units && filters.units.length > 0) {
        // Filtrar por unidades cuando la lógica esté implementada
      }
    }

    return allItems
  }, [products, services, events, filters])

  // Estadísticas de filtros
  const filterStats = useMemo(() => {
    const totalProducts = products.length
    const totalServices = services.length
    const totalEvents = events.length
    const totalItems = totalProducts + totalServices + totalEvents
    const filteredCount = filteredItems.length

    return {
      total: totalItems,
      filtered: filteredCount,
      products: totalProducts,
      services: totalServices,
      events: totalEvents,
      isFiltered: filteredCount < totalItems
    }
  }, [products.length, services.length, events.length, filteredItems.length])

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
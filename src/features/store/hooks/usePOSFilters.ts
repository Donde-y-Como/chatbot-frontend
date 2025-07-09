import { useCallback, useMemo, useState } from 'react'
import { Bundle } from '@/features/bundles/types.ts'
import { EventPrimitives } from '../../events/types'
import { Product, ProductStatus } from '../../products/types'
import { Service } from '../../appointments/types'
import { POSCategory, POSFilters, POSItem } from '../types'

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
  isActive: false,
}

interface UsePOSFiltersProps {
  products: Product[]
  services: Service[]
  events: EventPrimitives[]
  bundles: Bundle[]
}

export function usePOSFilters({
  products,
  services,
  events,
  bundles,
}: UsePOSFiltersProps) {
  const [filters, setFilters] = useState<POSFilters>(DEFAULT_FILTERS)

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<POSFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Cambiar categoría
  const setCategory = useCallback((category: POSCategory) => {
    setFilters((prev) => ({ ...prev, category }))
  }, [])

  // Actualizar búsqueda
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])

  // Toggle filtros activos
  const toggleFiltersActive = useCallback(() => {
    setFilters((prev) => ({ ...prev, isActive: !prev.isActive }))
  }, [])

  // Convertir datos a POSItems y filtrar
  const filteredItems = useMemo(() => {
    let allItems: POSItem[] = []

    // Agregar productos según categoría seleccionada (solo activos)
    if (filters.category === 'TODOS' || filters.category === 'PRODUCTOS') {
      const productItems = products
        .filter((product) => product.status !== ProductStatus.INACTIVO)
        .map((p): POSItem => ({ itemDetails: p, type: 'product' }))

      allItems.push(...productItems)
    }

    // Agregar servicios según categoría seleccionada (solo activos)
    if (filters.category === 'TODOS' || filters.category === 'SERVICIOS') {
      const serviceItems = services
        .filter(
          (service) => service.productInfo.status !== ProductStatus.INACTIVO
        )
        .map((s): POSItem => ({ itemDetails: s, type: 'service' }))

      allItems.push(...serviceItems)
    }

    // Agregar eventos según categoría seleccionada (solo activos)
    if (filters.category === 'TODOS' || filters.category === 'EVENTOS') {
      const eventItems = events
        .filter((event) => event.productInfo.status !== ProductStatus.INACTIVO)
        .map((e): POSItem => ({ itemDetails: e, type: 'event' }))

      allItems.push(...eventItems)
    }

    // Agregar paquetes según categoría seleccionada (solo activos)
    if (filters.category === 'TODOS' || filters.category === 'PAQUETES') {
      const bundleItems = bundles
        .filter((bundle) => bundle.status !== ProductStatus.INACTIVO)
        .map((b): POSItem => ({ itemDetails: b, type: 'bundle' }))

      allItems.push(...bundleItems)
    }

    // Eliminar duplicados basados en ID
    allItems = allItems.filter(
      (item, index, self) =>
        index ===
        self.findIndex((i) => i.itemDetails.id === item.itemDetails.id)
    )

    // Filtrar por búsqueda (nombre, SKU y código de barras)
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()

      allItems = allItems.filter((item) => {
        let instance: POSItem['itemDetails'] | null = null
        let skuMatch = false
        let barcodeMatch = false

        if (item.type === 'product') {
          instance = item.itemDetails as Product
          skuMatch = instance.sku.toLowerCase().includes(searchTerm)
          barcodeMatch =
            instance.barcode?.toLowerCase().includes(searchTerm) ?? false
        } else if (item.type === 'service') {
          instance = item.itemDetails as Service
          skuMatch = instance.productInfo.sku.toLowerCase().includes(searchTerm)
          barcodeMatch = instance.codigoBarras.toString().includes(searchTerm)
        }

        if (item.type === 'event') {
          instance = item.itemDetails as EventPrimitives
          skuMatch = instance.productInfo.sku.toLowerCase().includes(searchTerm)
        }

        if (item.type === 'bundle') {
          instance = item.itemDetails as Bundle
          skuMatch = instance.sku.toLowerCase().includes(searchTerm)
        }

        if (!instance) return false

        const nameMatch = instance.name.toLowerCase().includes(searchTerm)

        return nameMatch || skuMatch || barcodeMatch
      })
    }

    // Aquí se pueden agregar más filtros cuando filters.isActive sea true
    // Por ejemplo: filtros por precio, tags, categorías específicas, etc.
    if (filters.isActive) {
      // Aplicar filtros adicionales cuando estén implementados
      if (
        filters.priceRange &&
        (filters.priceRange.min !== undefined ||
          filters.priceRange.max !== undefined)
      ) {
        allItems = allItems.filter((item) => {
          const price = item.itemDetails.price.amount
          const minPrice = filters.priceRange?.min
          const maxPrice = filters.priceRange?.max

          const meetsMin = minPrice === undefined || price >= minPrice
          const meetsMax = maxPrice === undefined || price <= maxPrice

          return meetsMin && meetsMax
        })
      }

      // Filtrar por tags
      if (filters.tags && filters.tags.length > 0) {
        allItems = allItems.filter((item) => {
          const itemTags =
            'tagIds' in item.itemDetails
              ? item.itemDetails.tagIds
              : item.itemDetails.productInfo?.tagIds || []

          return filters.tags!.some((tagId) => itemTags.includes(tagId))
        })
      }

      // Filtrar por categorías
      if (filters.categories && filters.categories.length > 0) {
        allItems = allItems.filter((item) => {
          let itemCategories: string[] = []

          if ('categoryIds' in item.itemDetails) {
            itemCategories = item.itemDetails.categoryIds
          }

          if ('productInfo' in item.itemDetails) {
            itemCategories = item.itemDetails.productInfo.categoryIds || []
          }

          return filters.categories!.some((categoryId) =>
            itemCategories.includes(categoryId)
          )
        })
      }

      // Filtrar por subcategorías
      if (filters.subcategories && filters.subcategories.length > 0) {
        allItems = allItems.filter((item) => {
          let itemSubcategories: string[] = []

          if ('productInfo' in item.itemDetails) {
            itemSubcategories = item.itemDetails.productInfo.subcategoryIds
          }

          if ('subcategoryIds' in item.itemDetails) {
            itemSubcategories = item.itemDetails.subcategoryIds
          }

          return filters.subcategories!.some((subcategoryId) =>
            itemSubcategories.includes(subcategoryId)
          )
        })
      }

      // Filtrar por unidades (productos)
      if (filters.units && filters.units.length > 0) {
        allItems = allItems.filter((item) => {
          if (item.type !== 'product') return false

          const product = item.itemDetails as Product
          return product.unitId && filters.units!.includes(product.unitId)
        })
      }

      // Filtrar por estado
      if (filters.status) {
        allItems = allItems.filter((item) => {
          let itemStatus: string | undefined
          const expectedStatus = filters.status

          if ('status' in item.itemDetails) {
            itemStatus = item.itemDetails.status
          }

          if ('productInfo' in item.itemDetails) {
            itemStatus = item.itemDetails.productInfo.status
          }

          return itemStatus === expectedStatus
        })
      }

      // Filtrar eventos por activeOnly
      if (filters.activeOnly !== undefined) {
        allItems = allItems.filter((item) => {
          if (item.type !== 'event') return true

          // Lógica para determinar si un evento está activo
          const event = item.itemDetails as EventPrimitives
          if (!event || !event.duration) return false

          const now = new Date()
          const eventStart = new Date(event.duration.startAt)

          return filters.activeOnly ? eventStart > now : true
        })
      }

      // Filtrar por rango de fechas (solo eventos)
      if (
        filters.dateRange &&
        (filters.dateRange.from || filters.dateRange.to)
      ) {
        allItems = allItems.filter((item) => {
          if (item.type !== 'event') return true

          const event = item.itemDetails as EventPrimitives
          if (!event || !event.duration) return false

          const eventDate = new Date(event.duration.startAt)

          const meetsFrom =
            !filters.dateRange!.from || eventDate >= filters.dateRange!.from
          const meetsTo =
            !filters.dateRange!.to || eventDate <= filters.dateRange!.to

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
    const totalItems =
      totalProducts + totalServices + totalEvents + totalBundles
    const filteredCount = filteredItems.length

    return {
      total: totalItems,
      filtered: filteredCount,
      products: totalProducts,
      services: totalServices,
      events: totalEvents,
      bundles: totalBundles,
      isFiltered: filteredCount < totalItems,
    }
  }, [
    products.length,
    services.length,
    events.length,
    bundles.length,
    filteredItems.length,
  ])

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
    toggleFiltersActive,
  }
}

import { ProductStatus } from '@/types'
import { Service } from '@/features/appointments/types'

// Format currency
export const formatCurrency = (
  price: { amount: number; currency: string } | number,
  currency = 'MXN',
  locale = 'es-MX'
) => {
  if (typeof price === 'number') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(price)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount)
}

// Format duration
export const formatDuration = (duration: {
  value: number
  unit: 'minutes' | 'hours'
}) => {
  if (duration.unit === 'hours') {
    return `${duration.value} ${duration.value === 1 ? 'hora' : 'horas'}`
  }
  return `${duration.value} ${duration.value === 1 ? 'minuto' : 'minutos'}`
}

// Get service status based on product info
export const getServiceStatus = (service: Service) => {
  return service.productInfo?.status || ProductStatus.ACTIVE
}

// Check if service is available based on schedule
const isServiceAvailable = (service: Service) => {
  const schedule = service.schedule
  if (!schedule) return false
  
  // Check if service has any active schedule
  const hasActiveSchedule = Object.values(schedule).some(
    (timeRange) => timeRange.startAt !== timeRange.endAt
  )
  
  return hasActiveSchedule
}

// Get availability status for a service
const getAvailabilityStatus = (service: Service) => {
  const isAvailable = isServiceAvailable(service)
  if (!isAvailable) return 'unavailable'
  
  // Check if service has limited availability (less than 5 days per week)
  const activeDays = Object.values(service.schedule).filter(
    (timeRange) => timeRange.startAt !== timeRange.endAt
  ).length
  
  if (activeDays < 5) return 'limited'
  return 'available'
}

// Calculate service stats
export const calculateServiceStats = (services: Service[]) => {
  if (services.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      available: 0,
      limited: 0,
      unavailable: 0,
      totalValue: 0,
      averagePrice: 0,
      averageDuration: 0,
      mostExpensive: null as Service | null,
      leastExpensive: null as Service | null,
      longestDuration: null as Service | null,
      shortestDuration: null as Service | null,
      totalPhotos: 0,
      servicesWithPhotos: 0,
      uniqueCategories: 0,
      uniqueTags: 0,
      uniqueUnits: 0,
      priceRange: { min: 0, max: 0 },
      durationRange: { min: 0, max: 0 },
    }
  }

  const categoryIds = new Set<string>()
  const tagIds = new Set<string>()
  const unitIds = new Set<string>()
  
  let minPrice = Infinity
  let maxPrice = -Infinity
  let minDuration = Infinity
  let maxDuration = -Infinity
  let mostExpensiveService: Service | null = null
  let leastExpensiveService: Service | null = null
  let longestService: Service | null = null
  let shortestService: Service | null = null

  const stats = services.reduce(
    (acc, service) => {
      acc.total++

      // Status calculations
      const status = getServiceStatus(service)
      if (status === 'active') {
        acc.active++
      } else {
        acc.inactive++
      }

      // Availability calculations
      const availability = getAvailabilityStatus(service)
      if (availability === 'available') {
        acc.available++
      } else if (availability === 'limited') {
        acc.limited++
      } else {
        acc.unavailable++
      }

      // Financial calculations
      const priceAmount = service.price?.amount || 0
      acc.totalValue += priceAmount
      acc.totalPriceSum += priceAmount

      // Track price extremes
      if (priceAmount < minPrice) {
        minPrice = priceAmount
        leastExpensiveService = service
      }
      if (priceAmount > maxPrice) {
        maxPrice = priceAmount
        mostExpensiveService = service
      }

      // Duration calculations (convert to minutes)
      const durationInMinutes =
        service.duration.unit === 'hours'
          ? service.duration.value * 60
          : service.duration.value
      acc.totalDuration += durationInMinutes

      // Track duration extremes
      if (durationInMinutes < minDuration) {
        minDuration = durationInMinutes
        shortestService = service
      }
      if (durationInMinutes > maxDuration) {
        maxDuration = durationInMinutes
        longestService = service
      }

      // Photo calculations
      const photoCount = service.photos?.length || 0
      acc.totalPhotos += photoCount
      if (photoCount > 0) {
        acc.servicesWithPhotos++
      }

      // Category tracking
      if (service.productInfo?.categoryIds) {
        service.productInfo.categoryIds.forEach(id => categoryIds.add(id))
      }

      // Tag tracking
      if (service.productInfo?.tagIds) {
        service.productInfo.tagIds.forEach(id => tagIds.add(id))
      }

      // Unit tracking
      if (service.unidadMedida?.id) {
        unitIds.add(service.unidadMedida.id)
      }

      return acc
    },
    {
      total: 0,
      active: 0,
      inactive: 0,
      available: 0,
      limited: 0,
      unavailable: 0,
      totalValue: 0,
      totalPriceSum: 0,
      totalDuration: 0,
      totalPhotos: 0,
      servicesWithPhotos: 0,
    }
  )

  return {
    total: stats.total,
    active: stats.active,
    inactive: stats.inactive,
    available: stats.available,
    limited: stats.limited,
    unavailable: stats.unavailable,
    totalValue: stats.totalValue,
    averagePrice: stats.total > 0 ? stats.totalPriceSum / stats.total : 0,
    averageDuration: stats.total > 0 ? stats.totalDuration / stats.total : 0,
    mostExpensive: mostExpensiveService,
    leastExpensive: leastExpensiveService,
    longestDuration: longestService,
    shortestDuration: shortestService,
    totalPhotos: stats.totalPhotos,
    servicesWithPhotos: stats.servicesWithPhotos,
    uniqueCategories: categoryIds.size,
    uniqueTags: tagIds.size,
    uniqueUnits: unitIds.size,
    priceRange: { 
      min: minPrice === Infinity ? 0 : minPrice, 
      max: maxPrice === -Infinity ? 0 : maxPrice 
    },
    durationRange: { 
      min: minDuration === Infinity ? 0 : minDuration, 
      max: maxDuration === -Infinity ? 0 : maxDuration 
    },
  }
}

// Filter services
export const filterServices = (
  services: Service[],
  searchTerm: string,
  filters: {
    status?: string
    categoryIds?: string[]
    tagIds?: string[]
    unitIds?: string[]
    availability?: string[]
  } = {}
) => {
  return services.filter((service) => {
    // Text search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        (service.productInfo?.sku &&
          service.productInfo.sku.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status && getServiceStatus(service) !== filters.status) {
      return false
    }

    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const hasCategory = filters.categoryIds.some((categoryId) =>
        service.productInfo?.categoryIds?.includes(categoryId)
      )
      if (!hasCategory) return false
    }

    // Tag filter
    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasTag = filters.tagIds.some((tagId) =>
        service.productInfo?.tagIds?.includes(tagId)
      )
      if (!hasTag) return false
    }

    // Unit filter
    if (filters.unitIds && filters.unitIds.length > 0) {
      if (
        service.unidadMedida &&
        !filters.unitIds.includes(service.unidadMedida.id)
      ) {
        return false
      }
    }

    return true
  })
}

// Sort services
export const sortServices = (
  services: Service[],
  sortBy: 'name' | 'price' | 'duration' | 'createdAt' = 'name',
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  return [...services].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'price':
        comparison = a.price.amount - b.price.amount
        break
      case 'duration': {
        const aDuration =
          a.duration.unit === 'hours' ? a.duration.value * 60 : a.duration.value
        const bDuration =
          b.duration.unit === 'hours' ? b.duration.value * 60 : b.duration.value
        comparison = aDuration - bDuration
        break
      }
      default:
        comparison = 0
    }

    return sortDirection === 'desc' ? -comparison : comparison
  })
}

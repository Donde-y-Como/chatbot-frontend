import { ProductStatus } from '@/features/products/types'
import { Bundle } from '../types'

export const calculateBundleStats = (bundles: Bundle[]) => {
  const total = bundles.length
  const active = bundles.filter(
    (bundle) => bundle.status === ProductStatus.ACTIVO
  ).length
  const inactive = bundles.filter(
    (bundle) => bundle.status === ProductStatus.INACTIVO
  ).length
  const outOfStock = bundles.filter(
    (bundle) => bundle.status === ProductStatus.SIN_STOCK
  ).length

  return {
    total,
    active,
    inactive,
    outOfStock,
  }
}

export const formatBundlePrice = (amount: number, currency: string = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const getBundleStatusColor = (status: ProductStatus) => {
  switch (status) {
    case ProductStatus.ACTIVO:
      return 'text-green-600 bg-green-50'
    case ProductStatus.INACTIVO:
      return 'text-gray-600 bg-gray-50'
    case ProductStatus.SIN_STOCK:
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getBundleStatusLabel = (status: ProductStatus) => {
  switch (status) {
    case ProductStatus.ACTIVO:
      return 'Activo'
    case ProductStatus.INACTIVO:
      return 'Inactivo'
    case ProductStatus.SIN_STOCK:
      return 'Sin Stock'
    default:
      return 'Desconocido'
  }
}

export const validateBundleItems = (items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Debe agregar al menos un producto o servicio al bundle'
  }

  for (const item of items) {
    if (!item.itemId || !item.itemType || !item.quantity || item.quantity < 1) {
      return 'Todos los items deben tener ID, tipo y cantidad válidos'
    }

    if (!['product', 'service'].includes(item.itemType)) {
      return 'El tipo de item debe ser "product" o "service"'
    }
  }

  return null
}

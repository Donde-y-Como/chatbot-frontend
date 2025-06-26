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

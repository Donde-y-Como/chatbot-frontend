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

  // Revenue calculations
  const activeBundles = bundles.filter(bundle => bundle.status === ProductStatus.ACTIVO)
  const totalRevenue = activeBundles.reduce((sum, bundle) => sum + bundle.price.amount, 0)
  const totalCost = activeBundles.reduce((sum, bundle) => sum + bundle.cost.amount, 0)
  const averagePrice = activeBundles.length > 0 ? totalRevenue / activeBundles.length : 0
  const averageCost = activeBundles.length > 0 ? totalCost / activeBundles.length : 0
  
  // Profit margin calculation
  const totalProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  
  // Bundle composition insights
  const totalItems = bundles.reduce((sum, bundle) => sum + bundle.items.length, 0)
  const averageItemsPerBundle = bundles.length > 0 ? totalItems / bundles.length : 0
  
  // Service vs Product breakdown
  const serviceItems = bundles.flatMap(bundle => bundle.items.filter(item => item.type === 'service')).length
  const productItems = bundles.flatMap(bundle => bundle.items.filter(item => item.type === 'product')).length
  
  // High-value bundles (above average price)
  const highValueBundles = activeBundles.filter(bundle => bundle.price.amount > averagePrice).length
  
  return {
    // Basic counts
    total,
    active,
    inactive,
    outOfStock,
    
    // Financial metrics
    totalRevenue,
    totalCost,
    totalProfit,
    averagePrice,
    averageCost,
    profitMargin,
    
    // Composition metrics
    totalItems,
    averageItemsPerBundle,
    serviceItems,
    productItems,
    highValueBundles,
    
    // Percentages for better insights
    activePercentage: total > 0 ? (active / total) * 100 : 0,
    profitableBundles: activeBundles.filter(bundle => bundle.price.amount > bundle.cost.amount).length,
  }
}

export const formatBundlePrice = (amount: number, currency: string = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

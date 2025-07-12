import { Banknote, CreditCard, Package, TrendingUp, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { PaymentMethod } from '@/features/store/types'
import { Sale } from '../types'

interface SalesStatsProps {
  sales: Sale[]
}

export function SalesStats({ sales }: SalesStatsProps) {
  // Calcular estadísticas
  const totalSales = sales.length
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + sale.totalAmount.amount,
    0
  )
  const totalItems = sales.reduce((sum, sale) => sum + sale.itemCount, 0)
  const uniqueClients = new Set(sales.map((sale) => sale.clientId)).size

  // Estadísticas por método de pago
  const paymentStats = sales.reduce(
    (acc, sale) => {
      Object.entries(sale.paymentSummary).forEach(([method, amount]) => {
        if (amount && amount.amount > 0) {
          if (!acc[method as PaymentMethod]) {
            acc[method as PaymentMethod] = { total: 0, count: 0 }
          }
          acc[method as PaymentMethod].total += amount.amount
          acc[method as PaymentMethod].count += 1
        }
      })
      return acc
    },
    {} as Record<PaymentMethod, { total: number; count: number }>
  )

  // Promedio por venta
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Iconos para métodos de pago
  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className='h-4 w-4' />
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className='h-4 w-4' />
      default:
        return <Banknote className='h-4 w-4' />
    }
  }

  const getPaymentColor = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'text-green-600 bg-green-50'
      case 'credit_card':
        return 'text-blue-600 bg-blue-50'
      case 'debit_card':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'credit_card':
        return 'Tarjeta de Crédito'
      case 'debit_card':
        return 'Tarjeta de Débito'
      default:
        return method
    }
  }

  if (totalSales === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <Package className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
            <p className='text-muted-foreground'>No hay ventas para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total de Ventas */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total de Ventas</CardTitle>
          <Package className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalSales}</div>
          <p className='text-xs text-muted-foreground'>ventas registradas</p>
        </CardContent>
      </Card>

      {/* Ingresos Totales */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Ingresos Totales
          </CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {formatCurrency(totalRevenue)}
          </div>
          <p className='text-xs text-muted-foreground'>
            promedio: {formatCurrency(averageSale)}
          </p>
        </CardContent>
      </Card>

      {/* Artículos Vendidos */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Artículos Vendidos
          </CardTitle>
          <Package className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalItems}</div>
          <p className='text-xs text-muted-foreground'>
            promedio: {(totalItems / totalSales).toFixed(1)} por venta
          </p>
        </CardContent>
      </Card>

      {/* Clientes Únicos */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Clientes Únicos</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{uniqueClients}</div>
          <p className='text-xs text-muted-foreground'>clientes diferentes</p>
        </CardContent>
      </Card>

      {/* Métodos de Pago */}
      {Object.keys(paymentStats).length > 0 && (
        <Card className='md:col-span-2 lg:col-span-4'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>
              Distribución por Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
              {Object.entries(paymentStats).map(([method, stats]) => (
                <div
                  key={method}
                  className={`p-3 rounded-lg ${getPaymentColor(method as PaymentMethod)}`}
                >
                  <div className='flex items-center gap-2 mb-2'>
                    {getPaymentIcon(method as PaymentMethod)}
                    <span className='font-medium text-sm'>
                      {getPaymentLabel(method as PaymentMethod)}
                    </span>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-base font-bold'>
                      {formatCurrency(stats.total)}
                    </div>
                    <div className='flex gap-1 flex-wrap'>
                      <Badge
                        variant='outline'
                        className='text-xs px-1.5 py-0.5'
                      >
                        {stats.count} ventas
                      </Badge>
                      <Badge
                        variant='outline'
                        className='text-xs px-1.5 py-0.5'
                      >
                        {((stats.total / totalRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

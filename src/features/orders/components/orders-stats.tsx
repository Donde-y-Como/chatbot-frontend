import {
  Banknote,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { OrderWithDetails, PaymentMethod } from '@/features/store/types'

interface OrdersStatsProps {
  orders: OrderWithDetails[]
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  // Calcular estadísticas generales
  const totalOrders = orders.length
  const totalOrderValue = orders.reduce(
    (sum, order) => sum + order.totalAmount.amount,
    0
  )
  const totalPaid = orders.reduce(
    (sum, order) => sum + order.paidAmount.amount,
    0
  )
  const totalPending = orders.reduce(
    (sum, order) => sum + order.remainingAmount.amount,
    0
  )

  // Estadísticas por método de pago
  const paymentStats = orders.reduce(
    (acc, order) => {
      order.payments.forEach((payment) => {
        if (!acc[payment.method]) {
          acc[payment.method] = { total: 0, count: 0 }
        }
        acc[payment.method].total += payment.amount.amount
        acc[payment.method].count += 1
      })
      return acc
    },
    {} as Record<PaymentMethod, { total: number; count: number }>
  )

  // Promedio por orden
  const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0

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

  if (totalOrders === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <Package className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
            <p className='text-muted-foreground'>No hay órdenes para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total de Órdenes */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total de Órdenes
          </CardTitle>
          <Package className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalOrders}</div>
          <p className='text-xs text-muted-foreground'>órdenes registradas</p>
        </CardContent>
      </Card>

      {/* Valor Total de Órdenes */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Valor Total</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>
            {formatCurrency(totalOrderValue)}
          </div>
          <p className='text-xs text-muted-foreground'>
            promedio: {formatCurrency(averageOrderValue)}
          </p>
        </CardContent>
      </Card>

      {/* Total Pagado */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Pagado</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {formatCurrency(totalPaid)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {((totalPaid / totalOrderValue) * 100).toFixed(1)}% del total
          </p>
        </CardContent>
      </Card>

      {/* Total Pendiente */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Pendiente</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>
            {formatCurrency(totalPending)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {((totalPending / totalOrderValue) * 100).toFixed(1)}% del total
          </p>
        </CardContent>
      </Card>

      {Object.keys(paymentStats).length > 0 && (
        <Card className='md:col-span-2 lg:col-span-4'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>
              Métodos de pago
            </CardTitle>
          </CardHeader>
          <CardContent className='mt-4'>
            {Object.keys(paymentStats).length > 0 && (
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
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
                          {stats.count} pagos
                        </Badge>
                        <Badge
                          variant='outline'
                          className='text-xs px-1.5 py-0.5'
                        >
                          {((stats.total / totalPaid) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

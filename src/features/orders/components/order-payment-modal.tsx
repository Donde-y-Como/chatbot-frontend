import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderWithDetails, PaymentMethod } from '@/features/store/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface OrderPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderWithDetails
  onProcessPayment: (data: {
    orderId: string
    amountToPay: number
    cashReceived: number
    changeAmount: number
    paymentMethod: PaymentMethod
  }) => void
}

// Helper methods for rounding and currency formatting
const roundToTwoDecimals = (value: number | string): number => {
  return Math.round((parseFloat(value.toString()) + Number.EPSILON) * 100) / 100
}

const formatCurrencyAmount = (amount: number, currency: string = 'MXN'): string => {
  return roundToTwoDecimals(amount).toFixed(2) + ' ' + currency
}

export function OrderPaymentModal({
  isOpen,
  onClose,
  order,
  onProcessPayment,
}: OrderPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState(
    roundToTwoDecimals(order.remainingAmount.amount).toString()
  )
  const [cashReceived, setCashReceived] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [error, setError] = useState('')

  const resetFields = () => {
    setPaymentAmount(roundToTwoDecimals(order.remainingAmount.amount).toString())
    setCashReceived('')
    setPaymentMethod('cash')
    setError('')
  }

  const formatPrice = (price: { amount: number; currency: string }) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundToTwoDecimals(price.amount))
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
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

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'partial_paid':
        return 'Parcialmente Pagado'
      case 'paid':
        return 'Pagado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const handlePaymentAmountChange = (value: string) => {
    setPaymentAmount(value)
    setError('')

    if (value === '') return

    const amount = roundToTwoDecimals(value)
    if (isNaN(amount)) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (amount < 0) {
      setError('El monto debe ser mayor o igual a 0')
      return
    }

    const remainingRounded = roundToTwoDecimals(order.remainingAmount.amount)
    if (amount > remainingRounded) {
      setError('El monto no puede ser mayor al saldo pendiente')
      return
    }
  }

  const handleCashReceivedChange = (value: string) => {
    setCashReceived(value)
    setError('')

    if (value === '') return

    const amount = roundToTwoDecimals(value)
    if (isNaN(amount)) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (amount < 0) {
      setError('El monto debe ser mayor o igual a 0')
      return
    }

    const paymentAmountNum = roundToTwoDecimals(paymentAmount)
    if (amount < paymentAmountNum) {
      setError('El efectivo recibido debe ser mayor o igual al monto a pagar')
      return
    }
  }

  const handleProcessPayment = () => {
    const amountToPay = roundToTwoDecimals(paymentAmount)
    const remainingRounded = roundToTwoDecimals(order.remainingAmount.amount)
    
    if (
      isNaN(amountToPay) ||
      amountToPay < 0 ||
      amountToPay > remainingRounded
    ) {
      setError('Por favor ingresa un monto válido')
      return
    }

    let cashReceivedAmount = amountToPay
    if (paymentMethod === 'cash') {
      cashReceivedAmount = roundToTwoDecimals(cashReceived)
      if (isNaN(cashReceivedAmount) || cashReceivedAmount < 0) {
        setError('Por favor ingresa el efectivo recibido')
        return
      }

      if (cashReceivedAmount < amountToPay) {
        setError('El efectivo recibido debe ser mayor o igual al monto a pagar')
        return
      }
    }

    const rawChangeAmount = cashReceivedAmount - amountToPay
    const changeAmount = roundToTwoDecimals(rawChangeAmount < 1 ? 0 : rawChangeAmount)

    onProcessPayment({
      orderId: order.id,
      amountToPay,
      cashReceived: cashReceivedAmount,
      changeAmount,
      paymentMethod,
    })
    resetFields()
    onClose()
  }

  const isValidPayment = () => {
    if (!paymentAmount) return false
    const amount = roundToTwoDecimals(paymentAmount)
    const remainingRounded = roundToTwoDecimals(order.remainingAmount.amount)
    const isAmountValid =
      !isNaN(amount) && amount >= 0 && amount <= remainingRounded

    if (paymentMethod === 'cash') {
      if (!cashReceived) return false
      const cashReceivedAmount = roundToTwoDecimals(cashReceived)
      return (
        isAmountValid &&
        !isNaN(cashReceivedAmount) &&
        cashReceivedAmount >= amount
      )
    }

    return isAmountValid
  }

  const calculateChange = () => {
    if (!cashReceived || !paymentAmount) return 0
    const cashReceivedAmount = roundToTwoDecimals(cashReceived)
    const paymentAmountNum = roundToTwoDecimals(paymentAmount)
    const change = roundToTwoDecimals(cashReceivedAmount - paymentAmountNum)
    // Treat change less than 1 as zero (no cents change)
    return change < 1 ? 0 : change
  }

  const handleClose = () => {
    resetFields()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Procesar Pago de Orden</DialogTitle>
          <DialogDescription>
            Registra un pago para esta orden pendiente
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <ScrollArea className='h-[500px] pr-4'>
            <div className='space-y-6 p-1'>
              
              {/* Información de la orden */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Información de la Orden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">ID de Orden</Label>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                      <div className="mt-1">
                        <Badge variant={order.status === 'pending' ? 'outline' : 'secondary'}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                      <p className="font-mono text-sm">{order.clientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de Creación</Label>
                      <p className="text-sm">{format(parseISO(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumen de montos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Resumen de Pagos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total de la Orden</Label>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total Pagado</Label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPrice(order.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Saldo Pendiente</Label>
                      <p className="text-lg font-semibold text-red-600">
                        {formatPrice(order.remainingAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de pagos actuales */}
              {order.payments.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Pagos Registrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {getPaymentMethodLabel(payment.method)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                            {payment.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                            )}
                          </div>
                          <div className="font-semibold">
                            {formatPrice(payment.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Nuevo pago */}
              <div className='space-y-4'>
                <h3 className='font-semibold text-lg'>Registrar Nuevo Pago</h3>
                
                {/* Método de pago */}
                <div className='space-y-2'>
                  <Label htmlFor='paymentMethod'>Método de pago</Label>
                  <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Efectivo</SelectItem>
                      <SelectItem value="credit_card">💳 Tarjeta de Crédito</SelectItem>
                      <SelectItem value="debit_card">💳 Tarjeta de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monto a pagar */}
                <div className='space-y-2'>
                  <Label htmlFor='paymentAmount'>Monto a abonar</Label>
                  <div className='relative'>
                    <Input
                      id='paymentAmount'
                      type='number'
                      step='0.01'
                      min='0'
                      max={order.remainingAmount.amount}
                      value={paymentAmount}
                      onChange={(e) =>
                        handlePaymentAmountChange(e.target.value)
                      }
                      placeholder={`0.00 - ${formatPrice(order.remainingAmount)}`}
                      className={`pr-20 ${error ? 'border-destructive' : ''}`}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setPaymentAmount(roundToTwoDecimals(order.remainingAmount.amount).toString())
                      }
                      className='absolute right-1 top-1 h-7 px-3 text-xs'
                    >
                      Total
                    </Button>
                  </div>
                </div>

                {/* Campo específico para efectivo */}
                {paymentMethod === 'cash' && (
                  <div className='space-y-2'>
                    <Label htmlFor='cashReceived'>Efectivo recibido</Label>
                    <Input
                      id='cashReceived'
                      type='number'
                      step='0.01'
                      min='0'
                      value={cashReceived}
                      onChange={(e) => handleCashReceivedChange(e.target.value)}
                      placeholder='0.00'
                      className={error ? 'border-destructive' : ''}
                    />
                  </div>
                )}

                {error && <p className='text-sm text-destructive'>{error}</p>}

                {/* Resumen para efectivo */}
                {paymentMethod === 'cash' && paymentAmount && cashReceived && (
                  <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Abono:</span>
                      <span className='font-medium'>
                        {formatCurrencyAmount(
                          roundToTwoDecimals(paymentAmount),
                          order.totalAmount.currency
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Efectivo recibido:</span>
                      <span className='font-medium'>
                        {formatCurrencyAmount(
                          roundToTwoDecimals(cashReceived),
                          order.totalAmount.currency
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between text-sm font-semibold'>
                      <span>Cambio:</span>
                      <span
                        className={
                          calculateChange() >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {formatCurrencyAmount(
                          Math.abs(calculateChange()),
                          order.totalAmount.currency
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between text-sm font-semibold text-orange-600'>
                      <span>Nuevo saldo pendiente:</span>
                      <span>
                        {formatCurrencyAmount(
                          roundToTwoDecimals(order.remainingAmount.amount - roundToTwoDecimals(paymentAmount)),
                          order.totalAmount.currency
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button variant='outline' onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleProcessPayment}
            disabled={!isValidPayment()}
            className='min-w-32'
          >
            Registrar Pago
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
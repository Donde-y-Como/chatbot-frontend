import React, { useState } from 'react'
import { CheckCircle, Receipt } from 'lucide-react'
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
import { CartState, PaymentMethod } from '../types'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartState
  paymentMethod: PaymentMethod
  onProcessSale: (data: {
    amountToPay: number
    cashReceived: number
    changeAmount: number
    remainingBalance: number
    isPartialPayment: boolean
  }) => void
  onViewReceipt?: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  paymentMethod,
  onProcessSale,
  onViewReceipt,
}: CheckoutModalProps) {
  const [paymentAmount, setPaymentAmount] = useState(
    cart.total.amount.toString()
  )
  const [cashReceived, setCashReceived] = useState('')
  const [error, setError] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successPaymentData, setSuccessPaymentData] = useState<{
    amountPaid: number
    changeAmount: number
  } | null>(null)

  const resetFields = () => {
    setPaymentAmount(cart.total.amount.toString())
    setCashReceived('')
    setError('')
    setShowSuccessDialog(false)
    setSuccessPaymentData(null)
  }

  const formatPrice = (price: typeof cart.total) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(Math.round(price.amount * 100) / 100)
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

  const handlePaymentAmountChange = (value: string) => {
    setPaymentAmount(value)
    setError('')

    if (value === '') return

    const amount = parseFloat(value)
    if (isNaN(amount)) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (amount < 0) {
      setError('El monto debe ser mayor o igual a 0')
      return
    }

    if (amount > cart.total.amount) {
      setError('El monto no puede ser mayor al total')
      return
    }
  }

  const handleCashReceivedChange = (value: string) => {
    setCashReceived(value)
    setError('')

    if (value === '') return

    const amount = parseFloat(value)
    if (isNaN(amount)) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (amount < 0) {
      setError('El monto debe ser mayor o igual a 0')
      return
    }

    const paymentAmountNum = parseFloat(paymentAmount)
    if (amount < paymentAmountNum) {
      setError('El efectivo recibido debe ser mayor o igual al monto a pagar')
      return
    }
  }

  const handleProcessSale = () => {
    const amountToPay = parseFloat(paymentAmount)
    if (
      isNaN(amountToPay) ||
      amountToPay < 0 ||
      amountToPay > cart.total.amount
    ) {
      setError('Por favor ingresa un monto válido')
      return
    }

    let cashReceivedAmount = amountToPay
    if (paymentMethod === 'cash') {
      cashReceivedAmount = parseFloat(cashReceived)
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
    const changeAmount = rawChangeAmount < 1 ? 0 : Math.round(rawChangeAmount * 100) / 100
    const remainingBalance = Math.round((cart.total.amount - amountToPay) * 100) / 100
    const isPartialPayment = amountToPay < cart.total.amount

    // Show success dialog if payment > 0
    if (amountToPay > 0) {
      setSuccessPaymentData({
        amountPaid: amountToPay,
        changeAmount: changeAmount,
      })
      setShowSuccessDialog(true)
    }

    onProcessSale({
      amountToPay,
      cashReceived: cashReceivedAmount,
      changeAmount,
      remainingBalance,
      isPartialPayment,
    })

    // If payment is 0, close immediately, otherwise let success dialog handle closing
    if (amountToPay === 0) {
      resetFields()
      onClose()
    }
  }

  const isValidPayment = () => {
    if (!paymentAmount) return false
    const amount = parseFloat(paymentAmount)
    const isAmountValid =
      !isNaN(amount) && amount >= 0 && amount <= cart.total.amount

    if (paymentMethod === 'cash') {
      if (!cashReceived) return false
      const cashReceivedAmount = parseFloat(cashReceived)
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
    const cashReceivedAmount = parseFloat(cashReceived)
    const paymentAmountNum = parseFloat(paymentAmount)
    const change = cashReceivedAmount - paymentAmountNum
    // Treat change less than 1 as zero (no cents change)
    return change < 1 ? 0 : Math.round(change * 100) / 100
  }

  const handleClose = () => {
    resetFields()
    onClose()
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    setSuccessPaymentData(null)
    resetFields()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Procesar Venta</DialogTitle>
          <DialogDescription>
            Revisa los detalles de la venta y confirma el pago
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <ScrollArea className='h-[400px] pr-4'>
            <div className='space-y-4 p-1'>
              {/* Resumen de items */}
              <div>
                <h3 className='font-semibold mb-3'>Articulos en la orden</h3>
                <div className='space-y-2'>
                  {cart.items.map((item) => (
                    <div
                      key={item.itemId}
                      className='flex justify-between items-start p-3 bg-muted/50 rounded-lg'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-medium'>{item.itemName}</h4>
                          <Badge variant='outline' className='text-xs'>
                            {item.itemType === 'product'
                              ? 'Producto'
                              : item.itemType === 'service'
                                ? 'Servicio'
                                : item.itemType === 'event'
                                  ? 'Evento'
                                  : 'Paquete'}
                          </Badge>
                        </div>
                        <div className='text-sm text-muted-foreground mt-1'>
                          {item.itemType === 'event'
                            ? 'Participantes'
                            : 'Cantidad'}{' '}
                          : {item.quantity}
                        </div>
                        {item.notes && (
                          <div className='text-sm text-muted-foreground mt-1'>
                            Notas: {item.notes}
                          </div>
                        )}
                        {item.eventMetadata && (
                          <div className='text-sm text-muted-foreground mt-1'>
                            Fecha reservada:{' '}
                            {new Date(
                              item.eventMetadata.selectedDate
                            ).toLocaleDateString('es-MX')}
                          </div>
                        )}
                      </div>
                      <div className='text-right'>
                        <div className='font-medium'>
                          {formatPrice(item.totalPrice)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {formatPrice(item.effectiveUnitPrice)} c/u
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Resumen de totales */}
              <div className='space-y-2'>
                <div className='flex justify-between text-lg font-semibold'>
                  <span>Total:</span>
                  <span className='text-primary'>
                    {formatPrice(cart.total)}
                  </span>
                </div>
                <div className='flex justify-between text-sm text-muted-foreground'>
                  <span>Método de pago:</span>
                  <span>{getPaymentMethodLabel(paymentMethod)}</span>
                </div>
              </div>

              <Separator />

              {/* Campos de pago */}
              <div className='space-y-4'>
                {/* Monto a pagar */}
                <div className='space-y-2'>
                  <Label htmlFor='paymentAmount'>Monto a pagar</Label>
                  <div className='relative'>
                    <Input
                      id='paymentAmount'
                      type='number'
                      step='0.01'
                      min='0'
                      max={cart.total.amount}
                      value={paymentAmount}
                      onChange={(e) =>
                        handlePaymentAmountChange(e.target.value)
                      }
                      placeholder={`0.00 - ${formatPrice(cart.total)}`}
                      className={`pr-20 ${error ? 'border-destructive' : ''}`}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setPaymentAmount(cart.total.amount.toString())
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
                  <div className='bg-muted/50 p-3 rounded-lg space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>
                        {parseFloat(paymentAmount) < cart.total.amount
                          ? 'Abono:'
                          : 'Monto a pagar:'}
                      </span>
                      <span className='font-medium'>
                        {formatPrice({
                          amount: parseFloat(paymentAmount),
                          currency: cart.total.currency,
                        })}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Efectivo recibido:</span>
                      <span className='font-medium'>
                        {formatPrice({
                          amount: parseFloat(cashReceived),
                          currency: cart.total.currency,
                        })}
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
                        {formatPrice({
                          amount: Math.abs(calculateChange()),
                          currency: cart.total.currency,
                        })}
                      </span>
                    </div>
                    {parseFloat(paymentAmount) < cart.total.amount && (
                      <>
                        <Separator />
                        <div className='flex justify-between text-sm font-semibold text-orange-600'>
                          <span>Saldo pendiente:</span>
                          <span>
                            {formatPrice({
                              amount:
                                cart.total.amount - parseFloat(paymentAmount),
                              currency: cart.total.currency,
                            })}
                          </span>
                        </div>
                      </>
                    )}
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
            onClick={handleProcessSale}
            disabled={!isValidPayment()}
            className='min-w-32'
          >
            {paymentAmount && parseFloat(paymentAmount) < cart.total.amount
              ? 'Guardar Abono'
              : 'Procesar Venta'}
          </Button>
        </div>
      </DialogContent>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessDialogClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-12 h-12 bg-green-100 rounded-full'>
                <CheckCircle className='w-6 h-6 text-green-600' />
              </div>
              <div>
                <DialogTitle className='text-green-800'>
                  ¡Pago Exitoso!
                </DialogTitle>
                <DialogDescription>
                  El pago se ha procesado correctamente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {successPaymentData && (
            <div className='space-y-3 mt-4'>
              <div className='bg-green-50 p-4 rounded-lg space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-green-700'>Monto pagado:</span>
                  <span className='font-medium text-green-800'>
                    {formatPrice({
                      amount: successPaymentData.amountPaid,
                      currency: cart.total.currency,
                    })}
                  </span>
                </div>
                {successPaymentData.changeAmount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-green-700'>Cambio:</span>
                    <span className='font-medium text-green-800'>
                      {formatPrice({
                        amount: successPaymentData.changeAmount,
                        currency: cart.total.currency,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className='flex flex-col gap-2 mt-6'>
            <div className='flex gap-2'>
              {onViewReceipt && (
                <Button
                  variant='outline'
                  onClick={() => {
                    onViewReceipt()
                    handleSuccessDialogClose()
                  }}
                  className='flex-1 gap-2'
                >
                  <Receipt className='w-4 h-4' />
                  Ver Recibo
                </Button>
              )}
            </div>
            <Button onClick={handleSuccessDialogClose} className='w-full'>
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

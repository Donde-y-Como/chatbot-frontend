import React, { useState } from 'react'
import {
  Banknote,
  Calendar,
  CheckCircle,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ReceiptDialog } from '@/features/receipts/components/receipt-dialog'
import { useGetOrderReceipts } from '@/features/receipts/hooks'
import { OrderWithDetails, PaymentMethod } from '@/features/store/types'
import { useGetOrder } from '../hooks'

interface OrderDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
}

export function OrderDetailsDialog({
  isOpen,
  onClose,
  orderId,
}: OrderDetailsDialogProps) {
  const { data: orderResponse, isLoading, error } = useGetOrder(orderId)
  const { data: receiptsResponse } = useGetOrderReceipts(orderId)
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  )
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)

  const formatPrice = (price: { amount: number; currency: string }) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
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

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className='w-4 h-4' />
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className='w-4 h-4' />
      default:
        return <CircleDollarSign className='w-4 h-4' />
    }
  }

  const getStatusBadge = (status: OrderWithDetails['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='text-orange-600 border-orange-600'
          >
            <Clock className='w-3 h-3 mr-1' />
            Pendiente
          </Badge>
        )
      case 'partial_paid':
        return (
          <Badge variant='outline' className='text-blue-600 border-blue-600'>
            <CircleDollarSign className='w-3 h-3 mr-1' />
            Pago Parcial
          </Badge>
        )
      case 'paid':
        return (
          <Badge variant='outline' className='text-green-600 border-green-600'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Pagado
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='outline' className='text-red-600 border-red-600'>
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleViewReceipt = (paymentSequence: number) => {
    // Find the receipt for this payment sequence
    const receipt = receiptsResponse?.data?.find(
      (r) => r.paymentData.sequence === paymentSequence
    )
    if (receipt) {
      setSelectedReceiptId(receipt.id)
      setIsReceiptDialogOpen(true)
    }
  }

  const handleCloseReceiptDialog = () => {
    setIsReceiptDialogOpen(false)
    setSelectedReceiptId(null)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Detalles de la Orden</DialogTitle>
          <DialogDescription>
            Información completa de la orden y sus pagos
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          {isLoading && (
            <div className='flex items-center justify-center h-64'>
              <Loader2 className='w-8 h-8 animate-spin' />
              <span className='ml-2'>Cargando detalles...</span>
            </div>
          )}

          {error && (
            <div className='flex items-center justify-center h-64 text-red-600'>
              <p>Error al cargar los detalles de la orden</p>
            </div>
          )}

          {orderResponse?.data && (
            <ScrollArea className='h-[500px] pr-4'>
              <div className='space-y-6 p-1'>
                {/* Header con información básica */}
                <div className='bg-muted/50 p-4 rounded-lg'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        Orden #{orderResponse.data.id.slice(-8)}
                      </h3>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                        <Calendar className='w-4 h-4' />
                        <span>
                          Creada: {formatDate(orderResponse.data.createdAt)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                        <User className='w-4 h-4' />
                        <span>Cliente ID: {orderResponse.data.clientId}</span>
                      </div>
                    </div>
                    <div className='flex flex-col items-start sm:items-end gap-2'>
                      {getStatusBadge(orderResponse.data.status)}
                      <div className='text-sm text-muted-foreground'>
                        {orderResponse.data.itemCount} artículo
                        {orderResponse.data.itemCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artículos de la orden */}
                <div>
                  <h4 className='font-semibold mb-3'>Artículos</h4>
                  <div className='space-y-3'>
                    {orderResponse.data.items.map((item, index) => (
                      <div key={index} className='border rounded-lg p-4'>
                        <div className='flex justify-between items-start'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                              <h5 className='font-medium'>{item.name}</h5>
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
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground'>
                              <div>Cantidad: {item.quantity}</div>
                              <div>
                                Precio unitario: {formatPrice(item.unitPrice)}
                              </div>
                              <div>
                                Precio final: {formatPrice(item.finalPrice)}
                              </div>
                            </div>
                            {item.modifiedPrice && (
                              <div className='text-sm text-amber-600 mt-1'>
                                Precio modificado:{' '}
                                {formatPrice(item.modifiedPrice)}
                              </div>
                            )}
                            {item.notes && (
                              <div className='text-sm text-muted-foreground mt-2'>
                                <strong>Notas:</strong> {item.notes}
                              </div>
                            )}
                            {item.eventMetadata && (
                              <div className='text-sm text-muted-foreground mt-2'>
                                <strong>Fecha del evento:</strong>{' '}
                                {formatDate(item.eventMetadata.selectedDate)}
                              </div>
                            )}
                          </div>
                          <div className='text-right ml-4'>
                            <div className='font-semibold'>
                              {formatPrice({
                                amount:
                                  (item.modifiedPrice?.amount ||
                                    item.finalPrice.amount) * item.quantity,
                                currency: item.finalPrice.currency,
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Información de pagos */}
                <div>
                  <h4 className='font-semibold mb-3'>Historial de Pagos</h4>
                  {orderResponse.data.payments.length > 0 ? (
                    <div className='space-y-3'>
                      {orderResponse.data.payments.map((payment, index) => {
                        const paymentSequence = index + 1
                        const hasReceipt = receiptsResponse?.data?.some(
                          (r) => r.paymentData.sequence === paymentSequence
                        )

                        return (
                          <div
                            key={payment.id}
                            className='border rounded-lg p-4'
                          >
                            <div className='flex justify-between items-start'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                  {getPaymentMethodIcon(payment.method)}
                                  <span className='font-medium'>
                                    {getPaymentMethodLabel(payment.method)}
                                  </span>
                                  <Badge variant='outline' className='text-xs'>
                                    Pago #{paymentSequence}
                                  </Badge>
                                  {hasReceipt && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      <Receipt className='w-3 h-3 mr-1' />
                                      Recibo disponible
                                    </Badge>
                                  )}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  <Calendar className='w-4 h-4 inline mr-1' />
                                  {formatDate(payment.createdAt)}
                                </div>
                                {payment.notes && (
                                  <div className='text-sm text-muted-foreground mt-2'>
                                    <strong>Notas:</strong> {payment.notes}
                                  </div>
                                )}
                                {hasReceipt && (
                                  <div className='mt-3'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() =>
                                        handleViewReceipt(paymentSequence)
                                      }
                                      className='gap-2'
                                    >
                                      <FileText className='w-4 h-4' />
                                      Ver Recibo
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className='text-right ml-4'>
                                <div className='font-semibold text-green-600'>
                                  {formatPrice(payment.amount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      No hay pagos registrados para esta orden
                    </div>
                  )}
                </div>

                <Separator />

                {/* Resumen financiero */}
                <div className='bg-muted/50 p-4 rounded-lg'>
                  <h4 className='font-semibold mb-3'>Resumen Financiero</h4>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                    <div className='text-center p-3 bg-background rounded-lg'>
                      <div className='text-muted-foreground'>
                        Total de la Orden
                      </div>
                      <div className='text-lg font-semibold'>
                        {formatPrice(orderResponse.data.totalAmount)}
                      </div>
                    </div>
                    <div className='text-center p-3 bg-background rounded-lg'>
                      <div className='text-muted-foreground'>Monto Pagado</div>
                      <div className='text-lg font-semibold text-green-600'>
                        {formatPrice(orderResponse.data.paidAmount)}
                      </div>
                    </div>
                    <div className='text-center p-3 bg-background rounded-lg'>
                      <div className='text-muted-foreground'>
                        Saldo Pendiente
                      </div>
                      <div
                        className={`text-lg font-semibold ${orderResponse.data.remainingAmount.amount > 0 ? 'text-orange-600' : 'text-green-600'}`}
                      >
                        {formatPrice(orderResponse.data.remainingAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas de la orden */}
                {orderResponse.data.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className='font-semibold mb-2'>Notas de la Orden</h4>
                      <div className='bg-muted/50 p-3 rounded-lg text-sm'>
                        {orderResponse.data.notes}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className='flex justify-end pt-4 border-t'>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>

      {/* Receipt Dialog */}
      <ReceiptDialog
        isOpen={isReceiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        receiptId={selectedReceiptId}
      />
    </Dialog>
  )
}

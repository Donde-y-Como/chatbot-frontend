import React from 'react'
import {
  Banknote,
  Building,
  Calendar,
  CircleDollarSign,
  CreditCard,
  Loader2,
  Printer,
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
import { PaymentReceiptData, SuperReceiptData } from '@/features/store/types'
import { useGetReceipt } from '../hooks'

interface ReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  receiptId?: string | null
  receiptData?: PaymentReceiptData | SuperReceiptData | null
}

export function ReceiptDialog({
  isOpen,
  onClose,
  receiptId,
  receiptData,
}: ReceiptDialogProps) {
  const { data: receiptResponse, isLoading, error } = useGetReceipt(receiptId)
  
  // Use provided receiptData if available, otherwise use fetched data
  const receipt = receiptData || receiptResponse

  const formatPrice = (price: { amount: number; currency: string }) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }

  const getPaymentMethodLabel = (method: string) => {
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

  const getPaymentMethodIcon = (method: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePrintReceipt = () => {
    if (!receipt) return
    const isPaymentReceipt = receipt.type === 'PAYMENT_RECEIPT'

    // Create a printable receipt document
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const receiptContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <title>Recibo - ${receipt.receiptNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              background: white;
              color: black;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .business-info { 
              margin-bottom: 20px;
            }
            .business-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px;
            }
            .receipt-number { 
              font-size: 18px; 
              font-weight: bold; 
              margin: 10px 0;
            }
            .section { 
              margin: 20px 0; 
              padding: 15px;
              border: 1px solid #ddd;
            }
            .section-title { 
              font-weight: bold; 
              font-size: 16px; 
              margin-bottom: 10px;
              color: #333;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              padding: 3px 0;
            }
            .info-label { 
              font-weight: bold;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0;
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            .items-table th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .payment-summary { 
              background-color: #f9f9f9; 
              padding: 15px; 
              margin: 20px 0;
              border: 2px solid #333;
            }
            .total-amount { 
              font-size: 18px; 
              font-weight: bold; 
              text-align: center;
              margin: 10px 0;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px;
              color: #666;
            }
            @media print { 
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <!-- Receipt Header -->
          <div class="receipt-header">
            <div class="business-name">${receipt.businessSnapshot.name}</div>
            ${receipt.businessSnapshot.address ? `<div>${receipt.businessSnapshot.address}</div>` : ''}
            ${receipt.businessSnapshot.phone ? `<div>Tel: ${receipt.businessSnapshot.phone}</div>` : ''}
            ${receipt.businessSnapshot.email ? `<div>Email: ${receipt.businessSnapshot.email}</div>` : ''}
            <div class="receipt-number">Recibo: ${receipt.receiptNumber}</div>
            <div>Fecha: ${formatDate(receipt.createdAt)}</div>
          </div>

          <!-- Client Information -->
          <div class="section">
            <div class="section-title">Información del Cliente</div>
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span>${receipt.clientSnapshot.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${receipt.clientSnapshot.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dirección:</span>
              <span>${receipt.clientSnapshot.address}</span>
            </div>
          </div>

          <!-- Order Items -->
          <div class="section">
            <div class="section-title">Artículos de la Orden</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.orderSnapshot.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.unitPrice)}</td>
                    <td>${formatPrice(item.totalPrice)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <!-- Payment Information -->
          <div class="payment-summary">
            <div class="section-title">Información de Pago</div>
            ${
              isPaymentReceipt
                ? `
              <div class="info-row">
                <span class="info-label">Método de Pago:</span>
                <span>${getPaymentMethodLabel((receipt as PaymentReceiptData).paymentData.method)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Monto Pagado:</span>
                <span>${formatPrice((receipt as PaymentReceiptData).paymentData.amount)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha de Pago:</span>
                <span>${formatDate((receipt as PaymentReceiptData).paymentData.paymentDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Secuencia:</span>
                <span>Pago #${(receipt as PaymentReceiptData).paymentData.sequence}</span>
              </div>
              ${
                (receipt as PaymentReceiptData).paymentData.notes
                  ? `
                <div class="info-row">
                  <span class="info-label">Notas:</span>
                  <span>${(receipt as PaymentReceiptData).paymentData.notes}</span>
                </div>
              `
                  : ''
              }
            `
                : `
              <div class="section-title">Historial de Pagos</div>
              ${(receipt as SuperReceiptData).paymentHistory
                .map(
                  (payment) => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                  <div class="info-row">
                    <span class="info-label">Pago #${payment.sequence}:</span>
                    <span>${formatPrice(payment.amount)} - ${getPaymentMethodLabel(payment.method)}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span>${formatDate(payment.paymentDate)}</span>
                  </div>
                  ${
                    payment.notes
                      ? `
                    <div class="info-row">
                      <span class="info-label">Notas:</span>
                      <span>${payment.notes}</span>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            `
            }
          </div>

          <!-- Financial Summary -->
          <div class="section">
            <div class="section-title">Resumen Financiero</div>
            <div class="info-row">
              <span class="info-label">Total de la Orden:</span>
              <span>${formatPrice(receipt.orderSnapshot.totalAmount)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto Pagado:</span>
              <span>${formatPrice(receipt.orderSnapshot.paidAmount)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Saldo Pendiente:</span>
              <span>${formatPrice(receipt.orderSnapshot.remainingAmount)}</span>
            </div>
          </div>

          ${
            receipt.orderSnapshot.notes
              ? `
            <div class="section">
              <div class="section-title">Notas de la Orden</div>
              <div>${receipt.orderSnapshot.notes}</div>
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>Este es un recibo generado automáticamente</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-MX')}</p>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Detalle del Recibo</DialogTitle>
          <DialogDescription>
            Información completa del recibo de pago
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          {!receiptData && isLoading && (
            <div className='flex items-center justify-center h-64'>
              <Loader2 className='w-8 h-8 animate-spin' />
              <span className='ml-2'>Cargando recibo...</span>
            </div>
          )}

          {!receiptData && error && (
            <div className='flex items-center justify-center h-64 text-red-600'>
              <p>Error al cargar el recibo</p>
            </div>
          )}

          {receipt && (
            <ScrollArea className='h-[500px] pr-4'>
              <div className='space-y-6 p-1'>
                {/* Receipt Header */}
                <div className='bg-muted/50 p-4 rounded-lg'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        Recibo {receipt.receiptNumber}
                      </h3>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                        <Calendar className='w-4 h-4' />
                        <span>
                          Generado: {formatDate(receipt.createdAt)}
                        </span>
                      </div>
                      <Badge variant='outline' className='mt-2'>
                        {receipt.type === 'PAYMENT_RECEIPT'
                          ? 'Recibo de Pago'
                          : 'Recibo Completo'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className='font-semibold mb-3 flex items-center gap-2'>
                    <Building className='w-4 h-4' />
                    Información del Negocio
                  </h4>
                  <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                    <div>
                      <strong>Nombre:</strong>{' '}
                      {receipt.businessSnapshot.name}
                    </div>
                    {receipt.businessSnapshot.address && (
                      <div>
                        <strong>Dirección:</strong>{' '}
                        {receipt.businessSnapshot.address}
                      </div>
                    )}
                    {receipt.businessSnapshot.phone && (
                      <div>
                        <strong>Teléfono:</strong>{' '}
                        {receipt.businessSnapshot.phone}
                      </div>
                    )}
                    {receipt.businessSnapshot.email && (
                      <div>
                        <strong>Email:</strong>{' '}
                        {receipt.businessSnapshot.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h4 className='font-semibold mb-3 flex items-center gap-2'>
                    <User className='w-4 h-4' />
                    Información del Cliente
                  </h4>
                  <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                    <div>
                      <strong>Nombre:</strong>{' '}
                      {receipt.clientSnapshot.name}
                    </div>
                    <div>
                      <strong>Email:</strong>{' '}
                      {receipt.clientSnapshot.email}
                    </div>
                    <div>
                      <strong>Dirección:</strong>{' '}
                      {receipt.clientSnapshot.address}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h4 className='font-semibold mb-3'>Artículos de la Orden</h4>
                  <div className='space-y-3'>
                    {receipt.orderSnapshot.items.map((item, index) => (
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
                              <div>Total: {formatPrice(item.totalPrice)}</div>
                            </div>
                            {item.notes && (
                              <div className='text-sm text-muted-foreground mt-2'>
                                <strong>Notas:</strong> {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h4 className='font-semibold mb-3'>Información de Pago</h4>
                  {receipt.type === 'PAYMENT_RECEIPT' ? (
                    // Single payment receipt
                    <div className='border rounded-lg p-4'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            {getPaymentMethodIcon(
                              (receipt as PaymentReceiptData)
                                .paymentData.method
                            )}
                            <span className='font-medium'>
                              {getPaymentMethodLabel(
                                (receipt as PaymentReceiptData)
                                  .paymentData.method
                              )}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              Pago #
                              {
                                (receipt as PaymentReceiptData)
                                  .paymentData.sequence
                              }
                            </Badge>
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            <Calendar className='w-4 h-4 inline mr-1' />
                            {formatDate(
                              (receipt as PaymentReceiptData)
                                .paymentData.paymentDate
                            )}
                          </div>
                          {(receipt as PaymentReceiptData).paymentData
                            .notes && (
                            <div className='text-sm text-muted-foreground mt-2'>
                              <strong>Notas:</strong>{' '}
                              {
                                (receipt as PaymentReceiptData)
                                  .paymentData.notes
                              }
                            </div>
                          )}
                        </div>
                        <div className='text-right ml-4'>
                          <div className='font-semibold text-green-600'>
                            {formatPrice(
                              (receipt as PaymentReceiptData)
                                .paymentData.amount
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Super receipt with payment history
                    <div className='space-y-3'>
                      {(receipt as SuperReceiptData).paymentHistory.map(
                        (payment, index) => (
                          <div key={index} className='border rounded-lg p-4'>
                            <div className='flex justify-between items-start'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                  {getPaymentMethodIcon(payment.method)}
                                  <span className='font-medium'>
                                    {getPaymentMethodLabel(payment.method)}
                                  </span>
                                  <Badge variant='outline' className='text-xs'>
                                    Pago #{payment.sequence}
                                  </Badge>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  <Calendar className='w-4 h-4 inline mr-1' />
                                  {formatDate(payment.paymentDate)}
                                </div>
                                {payment.notes && (
                                  <div className='text-sm text-muted-foreground mt-2'>
                                    <strong>Notas:</strong> {payment.notes}
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
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Financial Summary */}
                <div className='bg-muted/50 p-4 rounded-lg'>
                  <h4 className='font-semibold mb-3'>Resumen Financiero</h4>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                    <div className='text-center p-3 bg-background rounded-lg'>
                      <div className='text-muted-foreground'>
                        Total de la Orden
                      </div>
                      <div className='text-lg font-semibold'>
                        {formatPrice(receipt.orderSnapshot.totalAmount)}
                      </div>
                    </div>
                    <div className='text-center p-3 bg-background rounded-lg'>
                      <div className='text-muted-foreground'>Monto Pagado</div>
                      <div className='text-lg font-semibold text-green-600'>
                        {formatPrice(receipt.orderSnapshot.paidAmount)}
                      </div>
                    </div>
                    <div className='text-center p-3 bg-background rounded-lg'>
                      <div className='text-muted-foreground'>
                        Saldo Pendiente
                      </div>
                      <div
                        className={`text-lg font-semibold ${receipt.orderSnapshot.remainingAmount.amount > 0 ? 'text-orange-600' : 'text-green-600'}`}
                      >
                        {formatPrice(
                          receipt.orderSnapshot.remainingAmount
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                {receipt.orderSnapshot.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className='font-semibold mb-2'>Notas de la Orden</h4>
                      <div className='bg-muted/50 p-3 rounded-lg text-sm'>
                        {receipt.orderSnapshot.notes}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className='flex justify-between pt-4 border-t'>
          <Button variant='outline' onClick={onClose}>
            Cerrar
          </Button>
          {receipt && (
            <Button onClick={handlePrintReceipt} className='gap-2'>
              <Printer className='w-4 h-4' />
              Imprimir Recibo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

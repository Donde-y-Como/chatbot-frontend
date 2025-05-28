import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AppointmentStatus, PaymentStatus, Deposit } from '../../types'
import { AppointmentStatusBadge, PaymentStatusBadge } from '../StatusBadges'

interface StatusAndPaymentStepProps {
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  deposit: Deposit | null
  onStatusChange: (status: AppointmentStatus) => void
  onPaymentStatusChange: (paymentStatus: PaymentStatus) => void
  onDepositChange: (deposit: Deposit | null) => void
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

export function StatusAndPaymentStep({
  status,
  paymentStatus,
  deposit,
  onStatusChange,
  onPaymentStatusChange,
  onDepositChange,
  onNext,
  onBack,
  onCancel,
}: StatusAndPaymentStepProps) {
  const handleDepositAmountChange = (value: string) => {
    const amount = parseFloat(value)
    
    if (value === '' || isNaN(amount)) {
      onDepositChange(null)
    } else {
      onDepositChange({
        amount,
        currency: deposit?.currency || 'MXN',
      })
    }
  }

  const handleDepositCurrencyChange = (currency: string) => {
    if (deposit) {
      onDepositChange({
        ...deposit,
        currency,
      })
    } else {
      onDepositChange({
        amount: 0,
        currency,
      })
    }
  }

  return (
    <div className='space-y-6 max-h-[60vh] overflow-y-auto'>
      <div className='text-center'>
        <h2 className='text-lg font-semibold mb-2'>
          Estado y Pago (Opcional)
        </h2>
        <p className='text-sm text-muted-foreground'>
          Configure el estado de la cita y la información de pago
        </p>
      </div>

      <div className='grid gap-4 px-1'>
        {/* Estado de la Cita */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Estado de la Cita</CardTitle>
            <CardDescription>Estado actual: <AppointmentStatusBadge status={status} /></CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={status} onValueChange={(value) => onStatusChange(value as AppointmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pendiente'>Pendiente</SelectItem>
                <SelectItem value='confirmada'>Confirmada</SelectItem>
                <SelectItem value='reprogramada'>Reprogramada</SelectItem>
                <SelectItem value='completada'>Completada</SelectItem>
                <SelectItem value='cancelada'>Cancelada</SelectItem>
                <SelectItem value='no asistió'>No Asistió</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Estado de Pago */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Estado de Pago</CardTitle>
            <CardDescription>Estado actual: <PaymentStatusBadge paymentStatus={paymentStatus} /></CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label>Estado de Pago</Label>
              <Select value={paymentStatus} onValueChange={(value) => onPaymentStatusChange(value as PaymentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pendiente'>Pendiente</SelectItem>
                  <SelectItem value='pagado'>Pagado</SelectItem>
                  <SelectItem value='parcial'>Pago Parcial</SelectItem>
                  <SelectItem value='reembolsado'>Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Abono/Depósito */}
            <div className='space-y-2'>
              <Label>Abono/Depósito (Opcional)</Label>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Input
                  type='number'
                  placeholder='0.00'
                  value={deposit?.amount?.toString() || ''}
                  onChange={(e) => handleDepositAmountChange(e.target.value)}
                  step='0.01'
                  min='0'
                  className='flex-1'
                />
                <Select 
                  value={deposit?.currency || 'MXN'} 
                  onValueChange={(value) => handleDepositCurrencyChange(value)}
                >
                  <SelectTrigger className='sm:w-24 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MXN'>MXN</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='EUR'>EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {deposit && deposit.amount > 0 && (
                <p className='text-sm text-muted-foreground'>
                  Abono: {deposit.amount.toLocaleString('es-MX')} {deposit.currency}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className='flex flex-col sm:flex-row sm:justify-between gap-4 pt-4'>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onCancel} className='flex-1 sm:flex-none'>
            Cancelar
          </Button>
          <Button variant='secondary' onClick={onBack} className='flex-1 sm:flex-none'>
            Atrás
          </Button>
        </div>
        <Button onClick={onNext} className='w-full sm:w-auto'>
          Continuar
        </Button>
      </div>
    </div>
  )
}
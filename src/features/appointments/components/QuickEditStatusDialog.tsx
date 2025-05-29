import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '../appointmentService'
import { UseGetAppointmentsQueryKey } from '../hooks/useGetAppointments'
import { AppointmentStatusBadge, PaymentStatusBadge } from './StatusBadges'
import type { Appointment, AppointmentStatus, Deposit, PaymentStatus } from '../types'

interface QuickEditStatusDialogProps {
  appointment: Appointment
}

export function QuickEditStatusDialog({ appointment }: QuickEditStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status || 'pendiente')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(appointment.paymentStatus || 'pendiente')
  const [deposit, setDeposit] = useState<Deposit | null>(appointment.deposit || null)
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  const handleDepositAmountChange = (value: string) => {
    const amount = parseFloat(value)
    
    if (value === '' || isNaN(amount)) {
      setDeposit(null)
    } else {
      setDeposit({
        amount,
        currency: deposit?.currency || 'MXN',
      })
    }
  }

  const handleDepositCurrencyChange = (currency: string) => {
    if (deposit) {
      setDeposit({
        ...deposit,
        currency,
      })
    } else {
      setDeposit({
        amount: 0,
        currency,
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      const result = await appointmentService.editAppointment(appointment.id, {
        ...appointment,
        status,
        paymentStatus,
        deposit,
      })

      if (result.id) {
        toast.success('Estado actualizado con éxito')
        setOpen(false)

        await queryClient.invalidateQueries({
          queryKey: [UseGetAppointmentsQueryKey],
        })
      } else {
        toast.error('Error al actualizar el estado')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStatus(appointment.status || 'pendiente')
    setPaymentStatus(appointment.paymentStatus || 'pendiente')
    setDeposit(appointment.deposit || null)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que se abra el diálogo padre
    setOpen(true)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Si se intenta abrir mediante el trigger, no hacer nada
      // porque ya manejamos esto en handleButtonClick
      return
    }
    setOpen(newOpen)
  }

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    handleReset()
    setOpen(false)
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que clicks dentro del dialog se propaguen
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline' className='h-8 px-2' onClick={handleButtonClick}>
          <Zap className='h-3 w-3 mr-1' />
          Edición Rápida
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md' onClick={handleDialogClick}>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold'>Edición Rápida</DialogTitle>
          <DialogDescription>
            Actualice rápidamente el estado y pago de la cita #{appointment.folio}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Estado Actual */}
          <div className='flex items-center gap-2 p-2 rounded-lg bg-muted/30'>
            <span className='text-sm font-medium'>Estado actual:</span>
            <AppointmentStatusBadge status={appointment.status || 'pendiente'} />
            <PaymentStatusBadge paymentStatus={appointment.paymentStatus || 'pendiente'} />
          </div>

          {/* Estado de la Cita */}
          <div className='space-y-2'>
            <Label htmlFor='quick-status'>Estado de la Cita</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as AppointmentStatus)}>
              <SelectTrigger id='quick-status'>
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
          </div>

          {/* Estado de Pago */}
          <div className='space-y-2'>
            <Label htmlFor='quick-payment'>Estado de Pago</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
              <SelectTrigger id='quick-payment'>
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
            <Label>Abono/Depósito</Label>
            <div className='flex gap-2'>
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
                <SelectTrigger className='w-20'>
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
              <p className='text-xs text-muted-foreground'>
                Abono: {deposit.amount.toLocaleString('es-MX')} {deposit.currency}
              </p>
            )}
          </div>

          {/* Vista Previa */}
          <div className='p-3 rounded-lg border bg-primary/5'>
            <div className='text-xs font-medium mb-2 text-primary'>Vista previa de cambios:</div>
            <div className='flex flex-wrap gap-1'>
              <AppointmentStatusBadge status={status} />
              <PaymentStatusBadge paymentStatus={paymentStatus} />
              {deposit && deposit.amount > 0 && (
                <Badge variant='outline' className='text-xs'>
                  Abono: {deposit.amount.toLocaleString('es-MX')} {deposit.currency}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant='outline' onClick={handleReset} disabled={loading}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

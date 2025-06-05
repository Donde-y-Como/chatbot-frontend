import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CalendarIcon, DollarSignIcon, Scissors, User, CreditCard, FileText, CheckCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card.tsx'
import { ClientPrimitives } from '@/features/clients/types'
import { useGetEmployees } from '../../hooks/useGetEmployees'
import { MinutesTimeRange, Service, AppointmentStatus, PaymentStatus, Deposit } from '../../types'
import { formatSlotHour } from '../../utils/formatters'
import { AppointmentStatusBadge, PaymentStatusBadge } from '../StatusBadges'

interface ConfirmationStepProps {
  date: Date
  timeRange: MinutesTimeRange
  selectedClient: ClientPrimitives | undefined
  selectedServices: Service[] | undefined
  selectedEmployeeIds: string[]
  // Nuevos campos para mostrar en el resumen
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  deposit: Deposit | null
  notes: string
  loading: boolean
  onSubmit: () => void
  onBack: () => void
  onCancel: (e?: React.MouseEvent) => void
}

/**
 * Step 4: Confirmation component
 */
export function ConfirmationStep({
  date,
  timeRange,
  selectedClient,
  selectedServices = [],
  selectedEmployeeIds,
  status,
  paymentStatus,
  deposit,
  notes,
  loading,
  onSubmit,
  onBack,
  onCancel,
}: ConfirmationStepProps) {
  const formattedTimeRange = `${formatSlotHour(timeRange.startAt)} - ${formatSlotHour(timeRange.endAt)}`
  const { data: employees } = useGetEmployees()
  const selectedEmployees = employees
    ? employees.filter((emp) => selectedEmployeeIds.includes(emp.id))
    : []

  return (
    <div className='space-y-4 '>
      <Card className='max-h-[40vh] overflow-auto'>
        <CardHeader className='pb-2'>
          <CardTitle>Resumen de la Cita</CardTitle>
          <CardDescription>Verifica los detalles de tu cita</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 '>
          <div className='flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            <div>
              <p className='text-sm text-muted-foreground'>Cliente</p>
              <div className='flex items-center gap-2'>
                {selectedClient && (
                  <Avatar className='h-6 w-6'>
                    <AvatarImage
                      src={selectedClient.photo}
                      alt={selectedClient.name}
                      className='object-cover'
                    />
                    <AvatarFallback>
                      {selectedClient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <p className='font-medium'>{selectedClient?.name}</p>
              </div>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <Scissors className='h-5 w-5 text-primary mt-1' />
            <div>
              <p className='text-sm text-muted-foreground'>Servicios</p>
              <div className='space-y-1 mt-1'>
                {selectedServices.map((service) => (
                  <p key={service.id} className='font-medium'>
                    {service.name}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <DollarSignIcon className='h-5 w-5 text-primary mt-1' />
            <div>
              <p className='text-sm text-muted-foreground'>Precio Total</p>
              <div className='space-y-1 mt-1'>
                <p className='font-medium text-lg'>
                  {selectedServices.length > 0 
                    ? `${selectedServices.reduce((total, service) => total + service.price.amount, 0).toFixed(2)} ${selectedServices[0]?.price.currency || ''}`
                    : '0.00'
                  }
                </p>
                {selectedServices.length > 1 && (
                  <p className='text-xs text-muted-foreground'>
                    ({selectedServices.length} servicios)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Abono/Depósito */}
          {deposit && deposit.amount > 0 && (
            <div className='flex items-start gap-2'>
              <CreditCard className='h-5 w-5 text-primary mt-1' />
              <div>
                <p className='text-sm text-muted-foreground'>Abono/Depósito</p>
                <div className='space-y-1 mt-1'>
                  <p className='font-medium text-lg text-green-600'>
                    {deposit.amount.toLocaleString('es-MX')} {deposit.currency}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Pagado por adelantado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estados */}
          <div className='flex items-start gap-2'>
            <CheckCircle className='h-5 w-5 text-primary mt-1' />
            <div>
              <p className='text-sm text-muted-foreground'>Estado de la Cita</p>
              <div className='flex gap-2 mt-1'>
                <AppointmentStatusBadge status={status} />
                <PaymentStatusBadge paymentStatus={paymentStatus} />
              </div>
            </div>
          </div>

          {/* Notas */}
          {notes && notes.trim() && (
            <div className='flex items-start gap-2'>
              <FileText className='h-5 w-5 text-primary mt-1' />
              <div>
                <p className='text-sm text-muted-foreground'>Notas</p>
                <div className='mt-1 p-2 bg-muted/50 rounded-md'>
                  <p className='text-sm'>{notes}</p>
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5 text-primary' />
            <div>
              <p className='text-sm text-muted-foreground'>Fecha y Hora</p>
              <p className='font-medium'>
                {format(date, 'PPPP', { locale: es })} • {formattedTimeRange}
              </p>
            </div>
          </div>

          <div>
            <div className='flex items-center gap-2 mb-1'>
              <User className='h-5 w-5 text-primary' />
              <p className='text-sm text-muted-foreground'>
                {selectedEmployees.length > 0
                  ? 'Empleados seleccionados'
                  : 'Sin empleados específicos'}
              </p>
            </div>

            {selectedEmployees.length > 0 && (
              <div className='flex -space-x-2 items-center flex-wrap ml-7 '>
                {selectedEmployees.map((employee, index) => (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Avatar
                        className='ring-2 ring-foreground/50 cursor-pointer transition-transform hover:scale-105 hover:z-10'
                        style={{
                          zIndex: 5 - index,
                        }}
                      >
                        <AvatarImage
                          src={employee.photo}
                          alt={employee.name}
                          className='object-cover'
                        />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-80'>
                      <div className='flex space-x-4'>
                        <Avatar>
                          <AvatarImage
                            src={employee.photo}
                            alt={employee.name}
                            className='object-cover'
                          />
                          <AvatarFallback>
                            {employee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className=' flex-1 overflow-hidden'>
                          <h4 className='text-sm font-semibold truncate'>
                            {employee.name}
                          </h4>
                          <h4 className='text-xd truncate'>
                            {employee.email}
                          </h4>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-between gap-2 mt-4'>
        <div className='flex gap-2'>
          <Button variant='destructive' onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant='outline' onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className='bg-primary hover:bg-primary/90'
        >
          {loading ? 'Procesando...' : 'Confirmar Cita'}
        </Button>
      </div>
    </div>
  )
}

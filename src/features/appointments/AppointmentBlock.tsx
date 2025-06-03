import React from 'react'
import { format, formatDistanceToNow, isBefore, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale/es'
import {
  Calendar,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  MessageSquare,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { EditAppointmentDialog } from '@/features/appointments/components/EditAppointmentDialog.tsx'
import { QuickEditStatusDialog } from '@/features/appointments/components/QuickEditStatusDialog.tsx'
import { useDialogState } from '@/features/appointments/contexts/DialogStateContext'
import { formatTime } from '@/features/appointments/utils/formatters'
import { ClientPrimitives } from '../clients/types'
import { Employee } from '../employees/types'
import { ClientChatButton } from './components/client-chat-button'
import { AppointmentStatusBadge, PaymentStatusBadge } from './components/StatusBadges'
import type { Appointment, Service } from './types'

interface AppointmentBlockProps {
  cancelAppointment: (id: string) => void
  appointment: Appointment
  employees: Employee[]
  services: Service[]
  client: ClientPrimitives
  column: number
  totalColumns: number
  workHours: {
    startAt: number
    endAt: number
  }
}

const MINUTE_HEIGHT = 64 / 60
const verticalGap = 4

export function AppointmentBlock({
  cancelAppointment,
  appointment,
  employees,
  services,
  client,
  column,
  totalColumns,
  workHours,
}: AppointmentBlockProps) {
  const eventStartMinutes = appointment.timeRange.startAt
  const startMinutesRelative = eventStartMinutes - workHours.startAt
  const duration = appointment.timeRange.endAt - appointment.timeRange.startAt
  const topOffset = startMinutesRelative * MINUTE_HEIGHT
  const eventHeight = duration * MINUTE_HEIGHT
  const adjustedTopOffset = topOffset + verticalGap / 2
  const adjustedEventHeight = eventHeight - verticalGap
  const leftPercent = (column / totalColumns) * 100
  const widthPercent = 100 / totalColumns

  const appointmentDate = new Date(appointment.date)
  const { openDialog, closeDialog } = useDialogState()
  const isUpcoming = isBefore(
    new Date(Date.now()),
    setMinutes(appointmentDate, appointment.timeRange.startAt)
  )

  const timeFromNow = formatDistanceToNow(
    setMinutes(new Date(appointmentDate), appointment.timeRange.startAt),
    {
      locale: es,
      addSuffix: true,
    }
  )

  const totalPrice = services
    .filter((service) => appointment.serviceIds.includes(service.id))
    .reduce((sum, service) => sum + service.price.amount, 0)

  const currency = services[0]?.price.currency || 'MXN'

  const formattedDate = format(
    new Date(appointment.date),
    "eeee d 'de' MMMM 'del' y",
    { locale: es }
  )

  const shortFormattedDate = format(new Date(appointment.date), 'dd MMM yyyy', {
    locale: es,
  })

  const durationInMinutes =
    appointment.timeRange.endAt - appointment.timeRange.startAt
  const durationFormatted =
    durationInMinutes >= 60
      ? `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60 > 0 ? `${durationInMinutes % 60}m` : ''}`
      : `${durationInMinutes}m`

  let status = 'upcoming'
  if (!isUpcoming) status = 'completed'

  const getStatusBadge = () => {
    switch (status) {
      case 'upcoming':
        return { label: 'Próxima', variant: 'default', timeInfo: timeFromNow }
      case 'completed':
        return { label: 'Completada', variant: 'secondary', timeInfo: null }
      default:
        return { label: 'Próxima', variant: 'default', timeInfo: null }
    }
  }

  const statusBadge = getStatusBadge()

  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        openDialog()
      } else {
        closeDialog()
      }
    }}>
      <DialogTrigger asChild>
        <div
          className={cn(
            'absolute rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90 border-2 border-background group',
            appointment.status === 'cancelada' && 'opacity-60 border-dashed border-red-300'
          )}
          style={{
            top: `calc(${adjustedTopOffset}px)`,
            height: `${adjustedEventHeight}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor:
              appointment.status === 'cancelada' 
                ? '#6b7280' // Gris para canceladas
                : employees.length > 0 ? employees[0].color : '#6c757d',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {duration > 60 ? (
            <div className='p-2 flex flex-col h-full'>
              <div className='flex items-center justify-between text-white text-sm font-semibold truncate'>
                <span>{client.name}</span>
                <Badge
                  variant='outline'
                  className='bg-white/20 text-white border-0 text-xs'
                >
                  {formatTime(appointment.timeRange.startAt)} -{' '}
                  {formatTime(appointment.timeRange.endAt)}
                </Badge>
              </div>
              <div className='text-white/90 text-xs truncate mt-1'>
                {appointment.status === 'cancelada' && (
                  <span className='bg-red-500/80 text-white text-xs px-1 py-0.5 rounded mr-1'>
                    CANCELADA
                  </span>
                )}
                {appointment.serviceNames
                  .map((s) => (s.length > 25 ? `${s.substring(0, 25)}...` : s))
                  .join(', ')}
              </div>
              {employees.length === 0 && (
                <div className='mt-auto text-white/80 text-xs flex items-center'>
                  <Users className='w-3 h-3 mr-1' />
                  <span>Sin asignar</span>
                </div>
              )}
            </div>
          ) : (
            <div className='p-1 flex items-center justify-between text-white text-xs font-semibold truncate h-full'>
              <div className='flex items-center gap-1'>
                <span>{client.name}</span>
                {appointment.status === 'cancelada' && (
                  <span className='bg-red-500/80 text-white text-xs px-1 py-0.5 rounded'>
                    CANCELADA
                  </span>
                )}
              </div>
              <span className='text-white/90'>
                {formatTime(appointment.timeRange.startAt)} -{' '}
                {formatTime(appointment.timeRange.endAt)}
              </span>
            </div>
          )}
          <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
            <Button
              size='sm'
              variant='secondary'
              className='pointer-events-none'
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className='p-0 overflow-hidden bg-background rounded-lg shadow-lg max-w-4xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col'>
        <DialogHeader className='flex-shrink-0 bg-primary/5 px-4 sm:px-6 py-4 border-b'>
          <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2 mb-2 flex-wrap'>
                <AppointmentStatusBadge status={appointment.status || 'pendiente'} />
                <PaymentStatusBadge paymentStatus={appointment.paymentStatus || 'pendiente'} />
                {statusBadge.timeInfo && (
                  <span className='text-xs text-muted-foreground'>
                    {statusBadge.timeInfo}
                  </span>
                )}
              </div>
              <DialogTitle className='text-xl font-semibold flex items-center gap-2'>
                <span>Cita #{appointment.folio}</span>
                {totalPrice > 0 && (
                  <Badge
                    variant='outline'
                    className='ml-2 bg-primary/10 border-primary/20'
                  >
                    {totalPrice.toLocaleString('es-MX')} {currency}
                  </Badge>
                )}
              </DialogTitle>

              <div className='flex items-center mt-2 text-sm text-muted-foreground'>
                <Calendar className='h-3.5 w-3.5 mr-1.5' />
                <span className='font-medium'>{shortFormattedDate}</span>
                <span className='mx-2'>•</span>
                <Clock className='h-3.5 w-3.5 mr-1.5' />
                <span>
                  {formatTime(appointment.timeRange.startAt)} -{' '}
                  {formatTime(appointment.timeRange.endAt)}
                </span>
                <span className='mx-2'>•</span>
                <span>{durationFormatted}</span>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <QuickEditStatusDialog appointment={appointment} />
              <EditAppointmentDialog appointment={appointment} />
            </div>
          </div>

          <DialogDescription
            className={cn(
              appointment.notes
                ? 'mt-3 text-sm p-3 bg-background/80 rounded-md border border-border/50'
                : 'sr-only'
            )}
          >
            {appointment.notes && (
              <>
                <span className='font-medium'>Notas:</span> {appointment.notes}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0'>
          <div className='space-y-6'>
            {/* Services Section */}
            <div>
              <h3 className='text-base font-medium mb-3 flex items-center'>
                <CreditCard className='h-4 w-4 mr-2 text-primary' />
                Servicios Contratados
              </h3>
              <div className='bg-primary/5 rounded-lg p-4 border border-border/50'>
                {services
                  .filter((service) =>
                    appointment.serviceIds.includes(service.id)
                  )
                  .map((service) => (
                    <div
                      key={service.id}
                      className='flex items-center justify-between mb-3 last:mb-0'
                    >
                      <div>
                        <h4 className='font-medium'>
                          {service.name.length > 25
                            ? `${service.name.substring(0, 25)}...`
                            : service.name}
                        </h4>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          {service.duration.value}{' '}
                          {service.duration.unit === 'hours'
                            ? 'horas'
                            : 'minutos'}
                        </p>
                      </div>
                      <Badge variant='outline' className='ml-auto'>
                        {service.price.amount.toLocaleString('es-MX')}{' '}
                        {service.price.currency}
                      </Badge>
                    </div>
                  ))}

                {totalPrice > 0 && (
                  <>
                    <Separator className='my-3' />
                    <div className='flex justify-between items-center'>
                      <span className='font-semibold'>Total</span>
                      <span className='font-semibold text-primary'>
                        {totalPrice.toLocaleString('es-MX')} {currency}
                      </span>
                    </div>
                    {appointment.deposit && (
                      <div className='flex justify-between items-center text-sm text-muted-foreground mt-2'>
                        <span>Abono registrado:</span>
                        <span className='font-medium'>
                          {appointment.deposit.amount.toLocaleString('es-MX')} {appointment.deposit.currency}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Assigned Staff Section */}
            <div>
              <h3 className='text-base font-medium mb-3 flex items-center'>
                <Users className='h-4 w-4 mr-2 text-primary' />
                {employees.length === 0
                  ? 'Personal (Sin asignar)'
                  : employees.length === 1
                    ? 'Personal Asignado'
                    : 'Personal Asignado'}
              </h3>

              {employees.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className='flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-primary/5'
                      style={{
                        borderLeftColor: employee.color,
                        borderLeftWidth: '4px',
                      }}
                    >
                      <Avatar className='h-10 w-10 border-2 border-background'>
                        <AvatarImage
                          src={employee.photo}
                          alt={employee.name}
                          className='object-cover'
                        />
                        <AvatarFallback
                          style={{ backgroundColor: employee.color }}
                          className='text-white'
                        >
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className='font-medium'>{employee.name}</h4>
                        <p className='text-xs text-muted-foreground'>
                          {employee.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex items-center p-4 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30'>
                  <Avatar className='h-10 w-10 bg-muted'>
                    <AvatarFallback>
                      <User className='h-5 w-5 text-muted-foreground' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='ml-3 text-sm text-muted-foreground'>
                    No hay personal asignado a esta cita
                  </div>
                </div>
              )}
            </div>

            {/* Client Info Section */}
            <div>
              <h3 className='text-base font-medium mb-3 flex items-center'>
                <User className='h-4 w-4 mr-2 text-primary' />
                Información del Cliente
              </h3>
              <div className='rounded-lg border border-border/50 overflow-hidden'>
                <div className='p-4 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
                  <Avatar className='h-14 w-14 border-2 border-background'>
                    <AvatarImage
                      src={client.photo}
                      alt={client.name}
                      className='object-cover'
                    />
                    <AvatarFallback className='bg-primary/20 text-primary font-medium text-lg'>
                      {client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <h3 className='text-base font-medium'>{client.name}</h3>
                    {client.platformIdentities &&
                      client.platformIdentities.length > 0 && (
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {client.platformIdentities.map((platform, idx) => (
                            <Badge
                              key={idx}
                              variant='outline'
                              className='text-xs capitalize'
                            >
                              {platform.platformName}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className='sm:ml-auto'>
                    <ClientChatButton clientId={client.id} />
                  </div>
                </div>

                <div className='p-4 grid grid-cols-1 gap-3'>
                  {client.email && (
                    <div className='flex items-start space-x-3'>
                      <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                      <div>
                        <span className='text-sm font-medium block'>
                          Correo
                        </span>
                        <a
                          href={`mailto:${client.email}`}
                          className='text-sm text-primary hover:underline'
                        >
                          {client.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {client.address && (
                    <div className='flex items-start space-x-3'>
                      <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                      <div>
                        <span className='text-sm font-medium block'>
                          Dirección
                        </span>
                        <p className='text-sm'>{client.address}</p>
                      </div>
                    </div>
                  )}
                  {client.notes && (
                    <div className='flex items-start space-x-3'>
                      <MessageSquare className='h-4 w-4 text-muted-foreground mt-0.5' />
                      <div>
                        <span className='text-sm font-medium block'>Notas</span>
                        <p className='text-sm'>{client.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Time Details - Expanded & Detailed */}
            <div>
              <h3 className='text-base font-medium mb-3 flex items-center'>
                <Calendar className='h-4 w-4 mr-2 text-primary' />
                Detalles de Fecha y Hora
              </h3>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div className='p-4 rounded-lg border border-border/50 bg-primary/5'>
                  <div className='flex items-center mb-2'>
                    <Calendar className='h-5 w-5 mr-2 text-primary' />
                    <h4 className='font-medium'>Fecha</h4>
                  </div>
                  <p className='text-sm first-letter:uppercase'>
                    {formattedDate}
                  </p>
                </div>
                <div className='p-4 rounded-lg border border-border/50 bg-primary/5'>
                  <div className='flex items-center mb-2'>
                    <Clock className='h-5 w-5 mr-2 text-primary' />
                    <h4 className='font-medium'>Horario</h4>
                  </div>
                  <p className='text-sm'>
                    <span className='font-medium'>
                      {formatTime(appointment.timeRange.startAt)}
                    </span>{' '}
                    a{' '}
                    <span className='font-medium'>
                      {formatTime(appointment.timeRange.endAt)}
                    </span>
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Duración: {durationFormatted}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex-shrink-0 px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row justify-end gap-3 bg-background'>
          <DialogClose asChild>
            <Button variant='secondary'>Cerrar</Button>
          </DialogClose>

          {isUpcoming && appointment.status !== 'cancelada' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Cancelar Cita
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Estás seguro de cancelar esta cita?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cambiará el estado de la cita{' '}
                    <strong>#{appointment.folio}</strong> agendada para el{' '}
                    <strong>{shortFormattedDate}</strong> a las{' '}
                    <strong>{formatTime(appointment.timeRange.startAt)}</strong>{' '}
                    a <strong>"Cancelada"</strong>.
                    <br />
                    <br />
                    La cita se mantendrá en el historial para referencia.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, mantener cita</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    Sí, cancelar cita
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

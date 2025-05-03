import { format, isBefore, parseISO, setMinutes } from 'date-fns'
import { CalendarIcon, ClockIcon } from '@radix-ui/react-icons'
import { now } from '@internationalized/date'
import { es } from 'date-fns/locale/es'
import { User as UserIcon } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatTime } from '@/features/appointments/utils/formatters.ts'
import { ClientPrimitives } from '../clients/types'
import { Employee } from '../employees/types'
import { ClientChatButton } from './components/client-chat-button'
import type { Appointment, Service } from './types'

interface EventBlockProps {
  cancelAppointment: (id: string) => void
  editAppointment?: (id: string, data: Partial<Appointment>) => void
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

export function EventBlock({
  cancelAppointment,
  appointment,
  employees,
  services,
  client,
  column,
  totalColumns,
  workHours,
}: EventBlockProps) {
  const eventStartMinutes = appointment.timeRange.startAt
  const startMinutesRelative = eventStartMinutes - workHours.startAt
  const duration = appointment.timeRange.endAt - appointment.timeRange.startAt
  const topOffset = startMinutesRelative * MINUTE_HEIGHT
  const eventHeight = duration * MINUTE_HEIGHT
  const adjustedTopOffset = topOffset + verticalGap / 2
  const adjustedEventHeight = eventHeight - verticalGap
  const leftPercent = (column / totalColumns) * 100
  const widthPercent = 100 / totalColumns

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className='absolute rounded  overflow-hidden cursor-pointer transition-opacity hover:opacity-90'
          style={{
            top: `calc(${adjustedTopOffset}px )`,
            height: `${adjustedEventHeight}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor:
              employees.length > 0 ? employees[0].color : 'darkgray',
          }}
        >
          {adjustedEventHeight >= MINUTE_HEIGHT * 60 - verticalGap ? (
            <div className='p-2'>
              <div className='flex items-center justify-between text-white text-sm font-semibold truncate'>
                {client.name}
                <small>
                  {formatTime(appointment.timeRange.startAt)} -{' '}
                  {formatTime(appointment.timeRange.endAt)}
                </small>
              </div>
              <div className='text-white text-xs truncate'>
                {appointment.serviceNames.join(', ')}
              </div>
            </div>
          ) : (
            <div className='p-1 flex items-center justify-between text-white text-xs font-semibold truncate'>
              {client.name} - {appointment.serviceNames.join(', ')}
              <small>
                {formatTime(appointment.timeRange.startAt)} -{' '}
                {formatTime(appointment.timeRange.endAt)}
              </small>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] p-6 bg-background rounded-lg shadow-lg'>
        <DialogHeader className='mb-4 border-b pb-2'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold'>
              {client.name} - {appointment.serviceNames.join(', ')}
            </DialogTitle>
            {/*{isBefore(*/}
            {/*  now('America/Mexico_City').toDate(),*/}
            {/*  setMinutes(*/}
            {/*    parseISO(appointment.date),*/}
            {/*    appointment.timeRange.startAt*/}
            {/*  )*/}
            {/*) && (*/}
            {/*  <EditAppointmentDialog*/}
            {/*    appointment={appointment}*/}
            {/*    employees={employees}*/}
            {/*    services={services}*/}
            {/*    client={client}*/}
            {/*  />*/}
            {/*)}*/}
          </div>
          <DialogDescription className='text-sm text-foreground/50'>
            {appointment.notes || 'Sin notas adicionales'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-5'>
          <div className='flex flex-col space-y-4'>
            <div className='flex -space-x-4'>
              {employees.map((employee, index) => (
                <Avatar
                  key={employee.id}
                  className='h-12 w-12 border-2 border-background'
                  style={{ zIndex: employees.length - index }}
                >
                  <AvatarImage
                    src={employee.photo}
                    alt={employee.name}
                    className='object-cover'
                  />
                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}

              {employees.length === 0 && (
                <Avatar className='h-12 w-12 border-2 border-background bg-muted'>
                  <AvatarFallback>
                    <UserIcon className='h-6 w-6 text-muted-foreground' />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div>
              <h3 className='text-lg font-semibold'>
                {employees.length > 0
                  ? employees.length === 1
                    ? employees[0].name
                    : `${employees.length} profesionales asignados`
                  : 'Sin asignación'}
              </h3>
              {employees.length === 1 && (
                <p className='text-sm text-muted-foreground'>
                  {employees[0].role}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center space-x-2 text-sm'>
              <CalendarIcon className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Fecha:</span>
              <span className='first-letter:uppercase'>
                {format(
                  new Date(appointment.date),
                  "eeee d 'de' MMMM 'del' y",
                  { locale: es }
                )}
              </span>
            </div>
            <div className='flex items-center space-x-2 text-sm'>
              <ClockIcon className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Hora:</span>
              <span>
                {formatTime(appointment.timeRange.startAt)} -{' '}
                {formatTime(appointment.timeRange.endAt)}
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <h4 className='font-semibold'>Servicio</h4>
            <Badge>{appointment.serviceNames.join(', ')}</Badge>
          </div>

          <div className='space-y-2'>
            <h4 className='font-semibold'>Cliente</h4>

            <section className='flex items-center gap-2'>
              <article className='relative'>
                <Avatar>
                  <AvatarImage
                    src={client.photo}
                    alt={client.name}
                    className='object-cover'
                  />
                  <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </article>
              <span>{client.name}</span>
            </section>
            <div className='mt-2'>
              <ClientChatButton clientId={client.id} />
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row justify-between gap-3 mt-6'>
          {isBefore(
            now('America/Mexico_City').toDate(),
            setMinutes(
              parseISO(appointment.date),
              appointment.timeRange.startAt
            )
          ) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' className='w-full sm:w-auto'>
                  Cancelar Cita
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cancelará la cita permanentemente. ¿Deseas
                    continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    Sí, cancelar cita
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <DialogClose asChild>
            <Button className='w-full sm:w-auto'>Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

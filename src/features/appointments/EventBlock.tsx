import React from 'react'
import { format, isBefore, parseISO, setMinutes } from 'date-fns'
import { CalendarIcon, ClockIcon } from '@radix-ui/react-icons'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { now } from '@internationalized/date'
import { es } from 'date-fns/locale/es'
import { cn } from '@/lib/utils.ts'
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
import { Client } from '@/features/chats/ChatTypes.ts'
import type { Appointment, Service } from './types'
import { Employee } from '../employees/types'

interface EventBlockProps {
  cancelAppointment: (id: string) => void
  appointment: Appointment
  employee: Employee
  service: Service
  client: Client
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
  employee,
  service,
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
            top: `${adjustedTopOffset}px`,
            height: `${adjustedEventHeight}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor: employee.color,
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
              <div className='text-white text-xs truncate'>{service.name}</div>
            </div>
          ) : (
            <div className='p-1 flex items-center justify-between text-white text-xs font-semibold truncate'>
              {client.name} - {service.name}
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
              {client.name} - {service.name}
            </DialogTitle>
          </div>
          <DialogDescription className='text-sm text-foreground/50'>
            {appointment.notes || 'Sin notas adicionales'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-5'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={employee.photo} alt={employee.name} className='object-cover'/>
              <AvatarFallback>
                {employee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>{employee.name}</h3>
              <p className='text-sm text-muted-foreground'>{employee.role}</p>
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
            <Badge>{service.name}</Badge>
            <p className='text-sm text-muted-foreground'>
              {service.description}
            </p>
            <p className='text-sm font-medium'>
              Precio: {service.price.amount} {service.price.currency}
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-semibold'>Cliente</h4>

            <section className='flex items-center gap-2'>
              <article className='relative'>
                <Avatar>
                  <AvatarImage src={client.photo} alt={client.name} className='object-cover'/>
                  <AvatarFallback>
                    {client.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </article>
              <span>{client.name}</span>
            </section>
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
              <Button
                variant='destructive'
                onClick={() => cancelAppointment(appointment._id)}
                className='w-full sm:w-auto'
              >
                Cancelar
              </Button>
            )}
          <DialogClose asChild>
            <Button className='w-full sm:w-auto'>Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

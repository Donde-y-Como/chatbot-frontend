'use client'

import type * as React from 'react'
import { format } from 'date-fns'
import { DialogDescription } from '@radix-ui/react-dialog'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Repeat,
  Users,
} from 'lucide-react'
import moment from 'moment-timezone'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import EventCarousel from '@/features/events/event-carousel'
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings'
import type { RecurrencePrimitives } from '@/features/events/types'

function formatDateRange(start: string, end: string) {
  return `${format(moment.tz(start, 'America/Mexico_City').toDate(), 'PP', { locale: es })} ${format(moment.tz(start, 'America/Mexico_City').toDate(), 'p', { locale: es })} - ${format(moment.tz(end, 'America/Mexico_City').toDate(), 'PP p', { locale: es })}`
}

function formatPrice(amount: number, currency: string) {
  return `${amount} ${currency}`
}

function formatRecurrence(recurrence: RecurrencePrimitives | null) {
  if (!recurrence) {
    return 'No se repite'
  }
  if (recurrence.frequency === 'daily') {
    return `Diario`
  }
  if (recurrence.frequency === 'weekly') {
    return `Semanalmente`
  }
  if (recurrence.frequency === 'monthly') {
    return `Mensualmente`
  }
  if (recurrence.frequency === 'yearly') {
    return `Anualmente`
  }
  return 'No se repite'
}

export function EventDetailsModal({
  eventId,
  open,
  onClose,
}: {
  eventId: string
  open: boolean
  onClose: () => void
}) {
  const { data: event, isLoading } = useGetEventWithBookings(eventId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='w-full max-w-4xl max-h-[90vh] overflow-hidden p-0'>
        <ScrollArea className='h-full'>
          {isLoading ? (
            <EventDetailsSkeleton />
          ) : event ? (
            <div className='flex flex-col md:flex-row'>
              <div className='md:w-1/2'>
                <EventCarousel event={event} />
              </div>
              <div className='p-6 md:w-1/2'>
                <DialogHeader>
                  <DialogTitle className='text-2xl font-bold mb-2'>
                    {event.name}
                  </DialogTitle>
                  <DialogDescription className='text-muted-foreground'>
                    {event.description}
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 mt-6'>
                  <EventDetailItem
                    icon={<Calendar className='w-5 h-5' />}
                    label='Fecha y hora'
                  >
                    {formatDateRange(
                      event.duration.startAt,
                      event.duration.endAt
                    )}
                  </EventDetailItem>

                  <EventDetailItem
                    icon={<Clock className='w-5 h-5' />}
                    label='Duración'
                  >
                    {formatDuration(
                      event.duration.startAt,
                      event.duration.endAt
                    )}
                  </EventDetailItem>

                  <EventDetailItem
                    icon={<Users className='w-5 h-5' />}
                    label='Capacidad'
                  >
                    {event.capacity.isLimited
                      ? `${event.capacity.maxCapacity} personas`
                      : 'Ilimitada'}
                  </EventDetailItem>

                  <EventDetailItem
                    icon={<MapPin className='w-5 h-5' />}
                    label='Ubicación'
                  >
                    {event.location}
                  </EventDetailItem>

                  <EventDetailItem
                    icon={<DollarSign className='w-5 h-5' />}
                    label='Precio'
                  >
                    {formatPrice(event.price.amount, event.price.currency)}
                  </EventDetailItem>

                  <EventDetailItem
                    icon={<Repeat className='w-5 h-5' />}
                    label='Recurrencia'
                  >
                    {formatRecurrence(event.recurrence)}
                  </EventDetailItem>
                </div>

                <div className='mt-8'>
                  <Badge variant='outline' className='text-sm'>
                    {event.capacity.isLimited
                      ? `${event.bookings.length} / ${event.capacity.maxCapacity} reservas`
                      : `${event.bookings.length} reservas`}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className='p-6 text-center text-muted-foreground'>
              No se encontró información del evento.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function EventDetailItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-start'>
      <div className='mr-3 mt-1 text-muted-foreground'>{icon}</div>
      <div>
        <div className='font-semibold text-sm'>{label}</div>
        <div className='text-sm text-muted-foreground'>{children}</div>
      </div>
    </div>
  )
}

function EventDetailsSkeleton() {
  return (
    <div className='flex flex-col md:flex-row animate-pulse'>
      <div className='md:w-1/2'>
        <Skeleton className='h-64 w-full' />
      </div>
      <div className='p-6 md:w-1/2'>
        <Skeleton className='h-8 w-3/4 mb-2' />
        <Skeleton className='h-4 w-full mb-6' />
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-start mb-4'>
            <Skeleton className='h-5 w-5 mr-3' />
            <div className='flex-1'>
              <Skeleton className='h-4 w-1/4 mb-1' />
              <Skeleton className='h-3 w-3/4' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDuration(start: string, end: string) {
  const duration = moment.duration(
    moment
      .tz(end, 'America/Mexico_City')
      .diff(moment.tz(start, 'America/Mexico_City'))
  )
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()

  return `${days > 0 ? `${days} día${days !== 1 ? 's' : ''}` : ''}${hours > 0 ? `${days > 0 ? ', ' : ''}${hours} hora${hours !== 1 ? 's' : ''}` : ''}${minutes > 0 ? `${days > 0 || hours > 0 ? ', ' : ''}${minutes} minuto${minutes !== 1 ? 's' : ''}` : ''}`
}

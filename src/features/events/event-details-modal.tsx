import * as React from 'react'
import { DialogDescription } from '@radix-ui/react-dialog'
import moment from 'moment-timezone'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import EventCarousel from '@/features/events/event-carousel.tsx'
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings.ts'
import { RecurrencePrimitives } from '@/features/events/types.ts'

// Helper to format the start and end dates in Spanish
function formatDateRange(start: number, end: number) {
  const startFormatted = moment(start).tz('America/Mexico_City').format('LLLL')
  const endFormatted = moment(end).tz('America/Mexico_City').format('LT')
  return `${startFormatted} - ${endFormatted}`
}

// Helper to format the price as currency
function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(
    amount
  )
}

// Helper to format the recurrence in Spanish
function formatRecurrence(recurrence: RecurrencePrimitives) {
  let freq: string
  switch (recurrence.frequency) {
    case 'daily':
      freq = 'Diario'
      break
    case 'weekly':
      freq = 'Semanal'
      break
    case 'monthly':
      freq = 'Mensual'
      break
    case 'yearly':
      freq = 'Anual'
      break
    case 'never':
      freq = 'Nunca'
      break
    default:
      freq = recurrence.frequency
  }
  if (!recurrence.endCondition) {
    return freq
  }
  if (recurrence.endCondition.type === 'occurrences') {
    return `${freq} (Finaliza tras ${recurrence.endCondition.occurrences} ocurrencias)`
  }
  if (recurrence.endCondition.type === 'date') {
    const until = new Date(recurrence.endCondition.until).toLocaleDateString(
      'es-ES',
      { dateStyle: 'long' }
    )
    return `${freq} (Hasta ${until})`
  }
  return freq
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

  if (isLoading || !event) return <div>Cargando...</div>

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='w-full max-w-[1200px] max-h-[90vh] overflow-hidden'>
        <ScrollArea className='w-full h-full p-4'>
          <DialogHeader>
            <DialogTitle>{event.name}</DialogTitle>
            <DialogDescription>{event.description}</DialogDescription>
          </DialogHeader>

          <div className='space-y-6 mt-4 w-full'>
            {/* Carrusel de imágenes */}
            <EventCarousel event={event} />

            {/* Detalles del evento */}
            <div className=''>
              <div>
                <strong>Fecha y hora:</strong>{' '}
                {formatDateRange(event.duration.startAt, event.duration.endAt)}
              </div>
              <div>
                <strong>Capacidad:</strong>{' '}
                {event.capacity.isLimited
                  ? `${event.capacity.maxCapacity} personas`
                  : 'Ilimitada'}
              </div>
              <div>
                <strong>Ubicación:</strong> {event.location}
              </div>
              <div>
                <strong>Precio:</strong>{' '}
                {formatPrice(event.price.amount, event.price.currency)}
              </div>
              <div>
                <strong>Recurrencia:</strong>{' '}
                {formatRecurrence(event.recurrence)}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

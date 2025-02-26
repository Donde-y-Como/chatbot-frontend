import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import EventCarousel from '@/features/events/event-carousel'
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings'
import { DialogDescription } from '@radix-ui/react-dialog'
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Repeat,
  Users,
} from 'lucide-react'
import { EventDetailBookings } from './details/event-detail-bookings'
import { EventDetailItem } from './details/event-detail-item'
import { EventDetailsSkeleton } from './details/event-details-skeleton'
import {
  formatDateRange,
  formatEventDuration,
  formatPrice,
  formatRecurrence,
} from './details/utils/formatters'
import { generateOccurrences } from './utils/occurrence'
import { EventDetailBookingsByDate } from './details/event-details-booking-by-date'

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

  // Added null check and return a loading state.  This fixes a bug when the event hasn't loaded yet.
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='w-full max-w-4xl max-h-[90vh] p-0'>
            <EventDetailsSkeleton />
        </DialogContent>
      </Dialog>
    )
  }

  if (!event) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='w-full max-w-4xl max-h-[90vh] p-0'>
           <div className='p-6 text-center text-muted-foreground'>
              No se encontró información del evento.
            </div>
        </DialogContent>
      </Dialog>
    )
  }


  const occurrences = generateOccurrences(
    event.duration,
    event.recurrence.frequency,
    event.recurrence.endCondition
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden p-0'>
        {/* Removed w-full and h-full classes from dialogContent to prevent scroll area from breaking layout,
          added flex and flex-col to ensure proper layout.
        */}
          <div className='flex flex-col md:flex-row'>
            <div className='md:w-1/2'>
              <EventCarousel event={event} />
            </div>
            {/* Applied ScrollArea to the content that needs to scroll */}
            <ScrollArea className='md:w-1/2 h-[calc(90vh-48px)]'> {/*Added a max-height here  and wrapped scrollArea in a div*/}
              <div className='p-6'>
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
                    {formatEventDuration(
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
                  {occurrences.length > 1 ? (
                    <EventDetailBookingsByDate
                      event={event}
                      occurrences={occurrences}
                    />
                  ) : (
                    <EventDetailBookings event={event} />
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
      </DialogContent>
    </Dialog>
  )
}
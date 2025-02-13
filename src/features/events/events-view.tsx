import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Calendar, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { EventCard } from '@/features/events/event-card.tsx'
import { useGetBookings } from '@/features/events/hooks/useGetBookings.ts'
import { useGetEvents } from '@/features/events/hooks/useGetEvents.ts'
import { EventPrimitives } from '@/features/events/types.ts'

export default function EventsView() {
  const { data: allBookings, isLoading } = useGetBookings()
  const { data: events, isLoading: isEventsLoading } = useGetEvents()

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventPrimitives[]> = {}

    if (!events) return groups

    events.forEach((event) => {
      const date = format(event.duration.startAt, 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })

    return groups
  }, [events])

  const handleDeleteEvent = (id: string) => {
    // Handle event deletion
    console.log('Deleting event:', id)
  }

  if (isLoading || isEventsLoading) return <div>Loading...</div>

  return (
    <div className='p-4 md:p-6 w-full'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Eventos</h1>
          <div className='flex items-center gap-2'>
            <Button variant='default'>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo Evento
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <Button variant='ghost' size='icon'>
              <List className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon'>
              <Calendar className='h-4 w-4' />
            </Button>
            <Select defaultValue='upcoming'>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Show' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='upcoming'>Próximos</SelectItem>
                <SelectItem value='past'>Pasados</SelectItem>
                <SelectItem value='all'>Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {Object.entries(groupedEvents).map(([date, events]) => (
          <div key={date}>
            <div className='mb-2 '>
              <h2 className='font-semibold first-letter:uppercase'>
                {format(new Date(date), 'MMM d', { locale: es })}
              </h2>
              <p className='text-sm text-muted-foreground first-letter:uppercase'>
                {format(new Date(date), 'EEEE', { locale: es })}
              </p>
            </div>
            <div>
              {events.map((event) => {
                const bookings =
                  allBookings?.filter(
                    (booking) => booking.eventId === event.id
                  ) || []

                return (
                  <EventCard
                    bookings={bookings}
                    onDelete={handleDeleteEvent}
                    key={event.id}
                    event={event}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

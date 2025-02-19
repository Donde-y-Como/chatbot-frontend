import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
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
import { EventApiService } from '@/features/events/EventApiService.ts'
import { EventCard } from '@/features/events/event-card.tsx'
import { EventCreateModal } from '@/features/events/event-create-modal.tsx'
import { useGetBookings } from '@/features/events/hooks/useGetBookings.ts'
import { useGetEvents } from '@/features/events/hooks/useGetEvents.ts'
import { EventPrimitives } from '@/features/events/types.ts'
import moment from "moment-timezone"

export default function EventsView() {
  const { data: allBookings, isLoading } = useGetBookings()
  const { data: events, isLoading: isEventsLoading } = useGetEvents()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventPrimitives[]> = {}

    if (!events) return groups

    events.forEach((event) => {
      const date = format(
        new Date(event.duration.startAt),
        'yyyy-MM-dd'
      )
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })

    return groups
  }, [events])

  const handleDeleteEvent = async (id: string) => {
    await EventApiService.deleteEvent(id)
    queryClient.setQueryData<EventPrimitives[]>(['events'], (oldEvents) => {
      if (!oldEvents) return oldEvents

      return [...oldEvents].filter((event) => event.id !== id)
    })
  }

  const handleCreateEvent = async (
    event: Omit<EventPrimitives, 'id' | 'businessId'>
  ) => {
    await EventApiService.createEvent(event)
    void queryClient.invalidateQueries({
      queryKey: ['events'],
    })
  }

  if (isLoading || isEventsLoading) return <div>Loading...</div>

  return (
    <div className='p-4 md:p-6 w-full'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Eventos</h1>
          <div className='flex items-center gap-2'>
            <Button variant='default' onClick={() => setShowCreate(true)}>
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
            <div className='mb-2'>
              <h2 className='font-semibold first-letter:uppercase'>
                {format(moment(date).tz("America/Mexico_City").toDate(), 'MMM d', { locale: es })}
              </h2>
              <p className='text-sm text-muted-foreground first-letter:uppercase'>
                {format(moment(date).tz("America/Mexico_City").toDate(), 'EEEE', { locale: es })}
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

      <EventCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreateEvent}
      />
    </div>
  )
}

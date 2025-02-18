import { useState } from 'react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { EventApiService } from '@/features/events/EventApiService.ts'
import { EventBookingModal } from '@/features/events/event-booking-modal.tsx'
import { EventDeleteDialog } from '@/features/events/event-delete-dialog.tsx'
import { EventDetailsModal } from '@/features/events/event-details-modal.tsx'
import { EventEditModal } from '@/features/events/event-edit-modal.tsx'
import {
  Booking,
  EventPrimitives,
  EventWithBookings,
} from '@/features/events/types.ts'

function translateRecurrente(frequency: string) {
  return frequency === 'weekly'
    ? 'semanalmente'
    : frequency === 'daily'
      ? 'diariamente'
      : frequency === 'monthly'
        ? 'mensualmente'
        : 'anualmente'
}

function getRecurrenceText(event: EventPrimitives) {
  if (event.recurrence.frequency === 'never') return null

  let text = `Se repite ${translateRecurrente(event.recurrence.frequency)}`

  if (event.recurrence.endCondition) {
    if (event.recurrence.endCondition.type === 'occurrences') {
      text += `, ${event.recurrence.endCondition.occurrences} veces`
    } else if (event.recurrence.endCondition.type === 'date') {
      text += `, hasta ${format(event.recurrence.endCondition.until, 'MMM d, yyyy')}`
    }
  }

  return text
}

export function EventCard({
  event,
  onDelete,
  bookings,
}: {
  bookings: Booking[]
  event: EventPrimitives
  onDelete: (id: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const recurrenceText = getRecurrenceText(event)
  const queryClient = useQueryClient()
  const bookGroupMutation = useMutation({
    mutationKey: ['bookGroupEvent'],
    mutationFn: async (variables: {
      eventId: string
      date: number
      clientIds: string[]
    }) => {
      await EventApiService.bookEvent(
        variables.eventId,
        variables.clientIds,
        variables.date
      )
    },
    onSuccess: (_data, changes) => {
      toast.success('Clients agendados correctamente')

      void queryClient.invalidateQueries({
        queryKey: ['event', event.id],
      })
    },
    onError: (data) => {
      console.log(data)
      toast.error('Hubo un error al agendar clientes en el evento')
    },
  })
  const updateEventMutation = useMutation({
    mutationKey: ['updateEvent'],
    mutationFn: async (changes: Partial<EventPrimitives>) => {
      await EventApiService.updateEvent(event.id, changes)
    },
    onSuccess: (_data, changes) => {
      toast.success('Evento actualizado correctamente')

      queryClient.setQueryData<EventPrimitives[]>(['events'], (oldEvents) => {
        if (!oldEvents) return oldEvents

        return oldEvents.map((existingEvent) =>
          existingEvent.id === event.id
            ? { ...existingEvent, ...changes }
            : existingEvent
        )
      })

      queryClient.setQueryData<EventWithBookings>(
        ['event', event.id],
        (oldEvent) => {
          if (!oldEvent) return oldEvent

          return { ...oldEvent, ...changes }
        }
      )
    },
    onError: (data) => {
      console.log(data)
      toast.error('Hubo un error al actualizar el evento')
    },
  })

  const handleEditedEvent = (changes: Partial<EventPrimitives>) => {
    updateEventMutation.mutate(changes)
  }

  const handleBookingEvent = async (clients: string[], date: Date) => {
    bookGroupMutation.mutate({
      eventId: event.id,
      clientIds: clients,
      date: date.getTime(),
    })
  }

  return (
    <>
      <Card className='mb-2'>
        <CardContent className='flex items-start gap-4 p-4'>
          <div className='w-1 self-stretch rounded-full bg-primary' />
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='font-semibold'>{event.name}</h3>
                <div className='text-sm text-muted-foreground'>
                  {format(event.duration.startAt, 'h:mm a')}
                  {event.capacity.isLimited && (
                    <Badge variant='secondary' className='ml-2'>
                      {`${bookings.length} /  ${event.capacity.maxCapacity} agendados`}
                    </Badge>
                  )}
                </div>
                {recurrenceText && (
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {recurrenceText}
                  </p>
                )}
              </div>
              <div className='flex items-center gap-2'>
                {event.price.amount > 0 && (
                  <Badge variant='secondary'>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: event.price.currency,
                    }).format(event.price.amount)}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowBooking(true)}>
                      Agendar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive'
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Eliminar Evento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EventDetailsModal
        eventId={event.id}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />

      <EventEditModal
        event={event}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleEditedEvent}
      />

      <EventBookingModal
        eventId={event.id}
        open={showBooking}
        onClose={() => setShowBooking(false)}
        onSave={handleBookingEvent}
      />

      <EventDeleteDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete(event.id)
          setShowDeleteDialog(false)
        }}
      />
    </>
  )
}

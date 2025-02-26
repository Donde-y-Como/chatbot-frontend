import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { EventBookingModal } from '@/features/events/event-booking-modal.tsx'
import { EventDeleteDialog } from '@/features/events/event-delete-dialog.tsx'
import { EventDetailsModal } from '@/features/events/event-details-modal.tsx'
import { EventEditModal } from '@/features/events/event-edit-modal.tsx'
import { Booking, EventPrimitives } from '@/features/events/types.ts'
import { format } from 'date-fns'
import { Clock, MapPin, MoreHorizontal, Users } from 'lucide-react'
import { useState } from 'react'
import { BookingDeleteDialog } from './booking-delete-dialog'
import { getRecurrenceText } from './utils/occurrence'
import { useEventMutations } from './hooks/useEventMutations'

export function EventCard({
  event,
  bookings,
}: {
  bookings: Booking[]
  event: EventPrimitives
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBookingDeleteDialog, setShowBookingDeleteDialog] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  
  const { updateEvent, bookEvent, deleteBooking, deleteEvent } = useEventMutations()

  const handleEditedEvent = (changes: Partial<EventPrimitives>) => {
    updateEvent(event.id, changes)
    setShowEdit(false)
  }

  const handleBookingEvent = async ({ clientId, date, participants }: { 
    clientId: string, 
    date: Date, 
    participants: number 
  }) => {
    bookEvent({
      eventId: event.id,
      clientId,
      date,
      participants,
      notes: ''
    })
  }

  const confirmBookingDeletion = async () => {
    if (!selectedBookingId) return

    try {
      deleteBooking({bookingId: selectedBookingId, eventId: event.id})
    } finally {
      setShowBookingDeleteDialog(false)
      setSelectedBookingId(null)
    }
  }

  const handleRemoveBooking = async (bookingId: Booking["id"]) => {
    setSelectedBookingId(bookingId)
    setShowBookingDeleteDialog(true)
  }

  const handleDeleteEvent = () => {
    deleteEvent(event.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card key={event.id} className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row">
          {event.photos && event.photos.length > 0 && (
            <div className="md:w-48 h-32 md:h-auto bg-muted relative">
              <img
                src={event.photos[0]}
                alt={event.name}
                className="object-cover w-full h-full"
                onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Sin+imagen" }}
              />
            </div>
          )}
          <div className="flex-1 flex flex-col md:flex-row">
            <CardContent className="flex-1 p-4">
              <div className="flex flex-col md:flex-row justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{event.name}</h3>
                    <div className="block">
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
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  {getRecurrenceText(event) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getRecurrenceText(event)}
                    </p>
                  )}
                </div>
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-1">
                  <Badge
                    variant={
                      event.capacity.isLimited &&
                        event.capacity.maxCapacity &&
                        bookings.reduce((sum, b) => sum + b.participants, 0) >= event.capacity.maxCapacity
                        ? "destructive"
                        : "outline"
                    }
                    className="whitespace-nowrap"
                  >
                    {event.capacity.isLimited && event.capacity.maxCapacity
                      ? `${bookings.reduce((sum, b) => sum + b.participants, 0)}/${event.capacity.maxCapacity} asistentes`
                      : `${bookings.reduce((sum, b) => sum + b.participants, 0)} asistentes`}
                  </Badge>
                  <div className="text-sm font-medium">
                    {event.price.amount > 0
                      ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: event.price.currency }).format(event.price.amount)
                      : "Gratis"}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>
                    {format(new Date(event.duration.startAt), 'HH:mm')} -
                    {format(new Date(event.duration.endAt), 'HH:mm')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{bookings.length} reservas</span>
                </div>
                <div className="flex items-center text-sm col-span-2 truncate">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
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
        onSaveBooking={handleBookingEvent}
        onRemoveBooking={handleRemoveBooking}
      />

      <BookingDeleteDialog
        open={showBookingDeleteDialog}
        onClose={() => setShowBookingDeleteDialog(false)}
        onConfirm={confirmBookingDeletion}
      />

      <EventDeleteDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteEvent}
      />
    </>
  )
}
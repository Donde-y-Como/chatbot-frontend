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
import { getRecurrenceText, generateOccurrences } from './utils/occurrence'
import { useEventMutations } from './hooks/useEventMutations'

export function EventCard({
  event,
  bookings: allBookings, // Rename prop to avoid shadowing and clarify its content
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
      deleteBooking({ bookingId: selectedBookingId, eventId: event.id })
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

  const occurrences = generateOccurrences(event.duration, event.recurrence.frequency, event.recurrence.endCondition);

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
                  <div className="text-sm font-medium">
                    {event.price.amount > 0
                      ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: event.price.currency }).format(event.price.amount)
                      : "Gratis"}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>
                    {format(new Date(event.duration.startAt), 'HH:mm')} -
                    {format(new Date(event.duration.endAt), 'HH:mm')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
        {occurrences.length > 1 && (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-2">Este evento tiene {occurrences.length} fechas:</p>
            <div className="flex flex-col gap-2">
              {occurrences.map((occurrence, index) => {
                const occurrenceDate = new Date(occurrence.startAt);
                const formattedDate = format(occurrenceDate, 'MMM d, yyyy');
                const bookingsForDate = allBookings.filter(booking => format(new Date(booking.date), 'MMM d, yyyy') === formattedDate);
                const totalParticipantsForDate = bookingsForDate.reduce((sum, b) => sum + b.participants, 0);
                const remainingSpotsForDate = event.capacity.isLimited && event.capacity.maxCapacity ? Math.max(0, event.capacity.maxCapacity - totalParticipantsForDate) : null;

                return (
                  <div key={index} className="border rounded-md p-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">{formattedDate}</h4>
                      <Badge
                        variant={
                          event.capacity.isLimited &&
                            event.capacity.maxCapacity &&
                            totalParticipantsForDate >= event.capacity.maxCapacity
                            ? "destructive"
                            : "outline"
                        }
                        className="whitespace-nowrap text-xs"
                      >
                        {event.capacity.isLimited && event.capacity.maxCapacity
                          ? `${totalParticipantsForDate}/${event.capacity.maxCapacity} asistentes`
                          : `${totalParticipantsForDate} asistentes`}
                        {remainingSpotsForDate !== null && remainingSpotsForDate === 0 && ' - Lleno'}
                        {remainingSpotsForDate !== null && remainingSpotsForDate > 0 && ` - ${remainingSpotsForDate} lugares`}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{bookingsForDate.length} reservas</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {occurrences.length <= 1 && ( // Show default info only if not recurring or only one occurrence (original logic)
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{allBookings.length} reservas</span>
              </div>

              {allBookings.length > 0 && (
                <Badge
                  variant={
                    event.capacity.isLimited &&
                      event.capacity.maxCapacity &&
                      allBookings.reduce((sum, b) => sum + b.participants, 0) >= event.capacity.maxCapacity
                      ? "destructive"
                      : "outline"
                  }
                  className="whitespace-nowrap col-span-2"
                >
                  {event.capacity.isLimited && event.capacity.maxCapacity
                    ? `${allBookings.reduce((sum, b) => sum + b.participants, 0)}/${event.capacity.maxCapacity} asistentes`
                    : `${allBookings.reduce((sum, b) => sum + b.participants, 0)} asistentes`}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
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
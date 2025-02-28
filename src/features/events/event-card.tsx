import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx'
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
import { Calendar, Clock, MapPin, MoreHorizontal, Tag, Users } from 'lucide-react'
import { useState } from 'react'
import { BookingDeleteDialog } from './booking-delete-dialog'
import { getRecurrenceText, generateOccurrences } from './utils/occurrence'
import { useEventMutations } from './hooks/useEventMutations'

export function EventCard({
  event,
  bookings: allBookings,
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
  const totalParticipants = allBookings.reduce((sum, b) => sum + b.participants, 0);
  const remainingSpots = event.capacity.isLimited && event.capacity.maxCapacity 
    ? Math.max(0, event.capacity.maxCapacity - totalParticipants) 
    : null;
  const isFullyBooked = event.capacity.isLimited && 
    event.capacity.maxCapacity && 
    totalParticipants >= event.capacity.maxCapacity;

  return (
    <>
      <Card 
        key={event.id} 
        className="overflow-hidden transition-all duration-300 shadow-lg border-1 h-full"
      >
        {/* Desktop: Horizontal layout with image on left */}
        {/* Mobile: Vertical layout with image on top */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image container */}
          <div className="lg:w-1/3 xl:w-1/4 aspect-[3/4] relative overflow-hidden">
            <img
              src={event.photos && event.photos.length ? event.photos[0] : "https://placehold.co/600x400?text=Sin+imagen"}
              alt={event.name}
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            />
            {event.price.amount > 0 ? (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: event.price.currency }).format(event.price.amount)}
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                Gratis
              </div>
            )}
          </div>

          {/* Content container */}
          <div className="flex-1 flex flex-col">
            <CardContent className="p-4 lg:p-6 flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-1">{event.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {isFullyBooked ? (
                      <Badge variant="destructive" className="text-xs">Agotado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {remainingSpots !== null 
                          ? `${remainingSpots} lugares disponibles` 
                          : 'Cupo disponible'}
                      </Badge>
                    )}
                    
                    {getRecurrenceText(event) && (
                      <Badge variant="secondary" className="text-xs">
                        Recurrente
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                </div>
                
                <div className="ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className="h-8 w-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span>
                    {format(new Date(event.duration.startAt), 'HH:mm')} -
                    {format(new Date(event.duration.endAt), 'HH:mm')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              {getRecurrenceText(event) && (
                <div className="flex items-center text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {getRecurrenceText(event)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                <span>
                  {event.capacity.isLimited && event.capacity.maxCapacity
                    ? `${totalParticipants}/${event.capacity.maxCapacity} asistentes`
                    : `${totalParticipants} asistentes`}
                </span>
              </div>
            </CardContent>

            <CardFooter className="px-4 py-3 bg-muted/20 border-t">
              {occurrences.length > 1 ? (
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowDetails(true)}
                  >
                    Ver {occurrences.length} fechas disponibles
                  </Button>
                </div>
              ) : (
                <div className="w-full flex justify-between items-center">
                  <div className="text-sm flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{allBookings.length} reservas</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBooking(true)}
                  >
                    Agendar
                  </Button>
                </div>
              )}
            </CardFooter>
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
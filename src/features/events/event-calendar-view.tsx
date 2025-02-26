import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookingDeleteDialog } from '@/features/events/booking-delete-dialog.tsx'
import { EventBookingModal } from '@/features/events/event-booking-modal.tsx'
import { EventDeleteDialog } from '@/features/events/event-delete-dialog.tsx'
import { EventDetailsModal } from '@/features/events/event-details-modal.tsx'
import { EventEditModal } from '@/features/events/event-edit-modal.tsx'
import { Booking, EventPrimitives } from '@/features/events/types.ts'
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight, Clock, MapPin, MoreHorizontal, Users } from 'lucide-react'
import { JSX, useState } from 'react'
import { useEventMutations } from './hooks/useEventMutations'

interface EventCalendarViewProps {
  events: EventPrimitives[];
  bookings: Booking[];
}

export function EventCalendarView({ events, bookings }: EventCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<EventPrimitives | null>(null)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const [showBooking, setShowBooking] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [showBookingDeleteDialog, setShowBookingDeleteDialog] = useState<boolean>(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const { updateEvent, bookEvent, deleteBooking, deleteEvent } = useEventMutations()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Semana comienza en lunes (1)
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const nextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const onDateClick = (day: Date): void => {
    setSelectedDate(day)
  }

  // Helper to get the current month's name with proper capitalization
  const getFormattedMonthName = (): string => {
    const monthName = format(currentDate, 'MMMM yyyy', { locale: es })
    return monthName.charAt(0).toUpperCase() + monthName.slice(1)
  }

  // Modal handlers
  const openEventDetails = (event: EventPrimitives): void => {
    setSelectedEvent(event)
    setShowDetails(true)
  }

  const openEventEdit = (event: EventPrimitives): void => {
    setSelectedEvent(event)
    setShowEdit(true)
  }

  const openEventBooking = (event: EventPrimitives): void => {
    setSelectedEvent(event)
    setShowBooking(true)
  }

  const openDeleteDialog = (event: EventPrimitives): void => {
    setSelectedEvent(event)
    setShowDeleteDialog(true)
  }

  const handleRemoveBooking = async (bookingId: Booking["id"]) => {
    setSelectedBookingId(bookingId)
    setShowBookingDeleteDialog(true)
  }

  // Event mutation handlers
  const handleEditedEvent = (changes: Partial<EventPrimitives>) => {
    if (!selectedEvent) return
    updateEvent(selectedEvent.id, changes)
    setShowEdit(false)
    setSelectedEvent(null)
  }

  const handleBookingEvent = async ({ clientId, date, participants }: {
    clientId: string,
    date: Date,
    participants: number
  }) => {
    if (!selectedEvent) return
    bookEvent({
      eventId: selectedEvent.id,
      clientId,
      date,
      participants,
      notes: ''
    })
    setShowBooking(false)
    setSelectedEvent(null)
  }

  const confirmBookingDeletion = async () => {
    if (!selectedBookingId || !selectedEvent) return
    deleteBooking({ bookingId: selectedBookingId, eventId: selectedEvent.id })
    setShowBookingDeleteDialog(false)
    setSelectedBookingId(null)
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent) return
    deleteEvent(selectedEvent.id)
    setShowDeleteDialog(false)
    setSelectedEvent(null)
  }

  const renderHeader = (): JSX.Element => {
    return (
      <div className="flex items-center justify-between mb-4 bg-background z-10 py-2">
        <Button variant="outline" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold capitalize">
          {getFormattedMonthName()}
        </h2>
        <Button variant="outline" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderDays = (): JSX.Element => {
    const weekDays: JSX.Element[] = []
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    for (let i = 0; i < 7; i++) {
      weekDays.push(
        <div key={i} className="text-center font-medium py-2">
          {days[i]}
        </div>
      )
    }

    return <div className="grid grid-cols-7 mb-2 bg-background z-10">{weekDays}</div>
  }

  const renderEventItem = (event: EventPrimitives) => {
    const eventBookings = bookings.filter(b => b.eventId === event.id)
    const totalParticipants = eventBookings.reduce((sum, booking) => sum + booking.participants, 0)
    const startTime = format(parseISO(event.duration.startAt), 'HH:mm')

    return (
      <Popover key={event.id}>
        <PopoverTrigger asChild>
          <div
            className="text-xs bg-secondary p-1 rounded truncate cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
          >
            <span className="font-medium">{startTime}</span>
            <span className="truncate flex-1">{event.name}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <h4 className="font-semibold">{event.name}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {format(parseISO(event.duration.startAt), 'HH:mm')} -
                  {format(parseISO(event.duration.endAt), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {event.capacity.isLimited && event.capacity.maxCapacity
                    ? `${totalParticipants}/${event.capacity.maxCapacity} asistentes`
                    : `${totalParticipants} asistentes`}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Acciones
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEventDetails(event)}>
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEventEdit(event)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEventBooking(event)}>
                    Agendar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => openDeleteDialog(event)}
                  >
                    Eliminar Evento
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const renderCells = (): JSX.Element => {
    const rows: JSX.Element[] = []
    let days: JSX.Element[] = []
    let day: Date = startDate
    let formattedDate: string = ''

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd')

        // Encuentra eventos para este día
        const dayEvents = events.filter(event =>
          isSameDay(parseISO(event.duration.startAt), day)
        )

        const isCurrentMonth = isSameMonth(day, monthStart)
        const isToday = isSameDay(day, new Date())
        const isSelected = selectedDate && isSameDay(day, selectedDate)

        const currentDay = day; // Capture current day for the closure

        days.push(
          <div
            key={currentDay.toString()}
            className={`min-h-24 p-1 border relative ${!isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : ''
              } ${isToday ? 'bg-primary/10' : ''} ${isSelected ? 'border-primary border-2' : ''
              }`}
            onClick={() => onDateClick(currentDay)}
          >
            <div className="h-6 flex justify-end">
              <span className={`text-sm rounded-full h-6 w-6 flex items-center justify-center ${isToday ? 'bg-primary text-primary-foreground' : ''
                }`}>
                {formattedDate}
              </span>
            </div>

            {dayEvents.length > 0 && (
              <div className="space-y-1">
                {dayEvents.map(event => renderEventItem(event))}
              </div>
            )}
          </div>
        )

        day = addDays(day, 1)
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      )

      days = []
    }

    return <div className="border rounded-lg overflow-hidden">{rows}</div>
  }

  return (
    <div className="flex flex-col">

      <div className="px-1">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>


      {/* Modals - using our shared mutation functions */}
      {selectedEvent && (
        <>
          <EventDetailsModal
            eventId={selectedEvent.id}
            open={showDetails}
            onClose={() => {
              setShowDetails(false)
              setSelectedEvent(null)
            }}
          />

          <EventEditModal
            event={selectedEvent}
            open={showEdit}
            onClose={() => {
              setShowEdit(false)
              setSelectedEvent(null)
            }}
            onSave={handleEditedEvent}
          />

          <EventBookingModal
            eventId={selectedEvent.id}
            open={showBooking}
            onClose={() => {
              setShowBooking(false)
              setSelectedEvent(null)
            }}
            onSaveBooking={handleBookingEvent}
            onRemoveBooking={handleRemoveBooking}
          />

          <EventDeleteDialog
            open={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false)
              setSelectedEvent(null)
            }}
            onConfirm={handleDeleteEvent}
          />
        </>
      )}

      <BookingDeleteDialog
        open={showBookingDeleteDialog}
        onClose={() => setShowBookingDeleteDialog(false)}
        onConfirm={confirmBookingDeletion}
      />
    </div>
  )
}
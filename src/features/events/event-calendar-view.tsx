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
import { EventCreateModal } from '@/features/events/event-create-modal.tsx'
import { EventDeleteDialog } from '@/features/events/event-delete-dialog.tsx'
import { EventDetailsModal } from '@/features/events/event-details-modal.tsx'
import { EventEditModal } from '@/features/events/event-edit-modal.tsx'
import { Booking, EventPrimitives } from '@/features/events/types.ts'
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight, Clock, MapPin, MoreHorizontal, Users } from 'lucide-react'
import { JSX, useState } from 'react'
import { useEventMutations } from './hooks/useEventMutations'
import { useBookingMutations } from './hooks/useBookingMutations'

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
  const [showCreateEventModal, setShowCreateEventModal] = useState<boolean>(false)

  const { updateEvent, deleteEvent } = useEventMutations()
  const { createBooking, updateBooking, deleteBooking } = useBookingMutations()

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
    setShowCreateEventModal(true)
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

  const handleBookingEvent = async ({ clientId, date, participants, notes, status, amount, paymentStatus }: {
    clientId: string,
    date: Date,
    participants: number,
    notes?: string,
    status?: string,
    amount?: number,
    paymentStatus?: string
  }) => {
    if (!selectedEvent) return
    const bookingData = {
      eventId: selectedEvent.id,
      clientId,
      date: date.toISOString(),
      participants,
      notes: notes || '',
      status: status || 'pendiente',
      amount: amount || 0,
      paymentStatus: paymentStatus || 'pendiente'
    }
    await createBooking(bookingData)
    setShowBooking(false)
    setSelectedEvent(null)
  }

  const handleUpdateBooking = async (bookingId: string, data: any) => {
    await updateBooking({ bookingId, data })
  }

  const confirmBookingDeletion = async () => {
    if (!selectedBookingId) return
    await deleteBooking(selectedBookingId)
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

  const renderEventItem = (event: EventPrimitives, currentDay: Date) => {
    const eventBookings = bookings.filter(b => b.eventId === event.id)
    const totalParticipants = eventBookings.reduce((sum, booking) => sum + booking.participants, 0)
    const eventStart = parseISO(event.duration.startAt)
    const eventEnd = parseISO(event.duration.endAt)
    
    // Check if this is the first day of the event
    const isFirstDay = isSameDay(eventStart, currentDay)
    // Check if this is the last day of the event
    const isLastDay = isSameDay(eventEnd, currentDay)
    // Check if this event spans multiple days
    const isMultiDayEvent = !isSameDay(eventStart, eventEnd)
    
    // Show start time only on the first day
    const timeDisplay = isFirstDay ? format(eventStart, 'HH:mm') : ''
    
    // Visual indicators for multi-day events
    let eventIndicator = ''
    let eventClasses = ''
    if (isMultiDayEvent) {
      if (!isFirstDay && !isLastDay) {
        // Middle day of a multi-day event
        eventIndicator = '… '
        eventClasses = 'bg-secondary/90'
      } else if (!isFirstDay && isLastDay) {
        // Last day of a multi-day event
        eventIndicator = '✔ '
        eventClasses = 'bg-secondary/90'
      } else if (isFirstDay && !isLastDay) {
        // First day of a multi-day event
        eventIndicator = '→ '
        eventClasses = 'bg-secondary'
      }
    }

    return (
      <Popover key={event.id}>
        <PopoverTrigger asChild>
          <div
            className={`text-xs p-1 truncate cursor-pointer hover:opacity-90 flex items-center gap-1 ${eventClasses || 'bg-secondary'} ${isMultiDayEvent ? 'border-l-2 border-primary' : ''} ${isFirstDay ? 'rounded-l' : ''} ${isLastDay ? 'rounded-r' : ''} ${!isFirstDay && !isLastDay ? '' : 'rounded'}`}
          >
            {timeDisplay && <span className="font-medium">{timeDisplay}</span>}
            <span className="truncate flex-1">{eventIndicator}{event.name}</span>
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
                  {!isSameDay(parseISO(event.duration.startAt), parseISO(event.duration.endAt)) ? (
                    <>
                      {format(parseISO(event.duration.startAt), 'dd/MM HH:mm')} -
                      {format(parseISO(event.duration.endAt), 'dd/MM HH:mm')}
                    </>
                  ) : (
                    <>
                      {format(parseISO(event.duration.startAt), 'HH:mm')} -
                      {format(parseISO(event.duration.endAt), 'HH:mm')}
                    </>
                  )}
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

        // Capture current day for the closure
        const currentDay = day;

        // Encuentra eventos para este día (incluyendo eventos multiday)
        const dayEvents = events.filter(event => {
          const eventStartDate = parseISO(event.duration.startAt)
          const eventEndDate = parseISO(event.duration.endAt)
          
          // FIXED: Comparar solo fechas, no horas para evitar problemas de timezone
          const dayOnly = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate())
          const startOnly = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate())
          const endOnly = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
          
          // Checks if the current day falls within the event's duration (inclusive)
          return dayOnly >= startOnly && dayOnly <= endOnly
        })

        const isCurrentMonth = isSameMonth(day, monthStart)
        const isToday = isSameDay(day, new Date())
        const isSelected = selectedDate && isSameDay(day, selectedDate)

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
                {dayEvents.map(event => renderEventItem(event, currentDay))}
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
            onUpdateBooking={handleUpdateBooking}
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

      {/* Create Event Modal - opens when clicking on a calendar day */}
      <EventCreateModal
        open={showCreateEventModal}
        onClose={() => {
          setShowCreateEventModal(false)
          setSelectedDate(null)
        }}
        defaultDate={selectedDate || undefined}
      />
    </div>
  )
}

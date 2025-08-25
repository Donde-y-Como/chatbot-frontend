import { JSX, useState } from 'react'
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookingDeleteDialog } from '@/features/events/booking-delete-dialog.tsx'
import { EventBookingModal } from '@/features/events/event-booking-modal.tsx'
import { EventCreateModal } from '@/features/events/event-create-modal.tsx'
import { EventDeleteDialog } from '@/features/events/event-delete-dialog.tsx'
import { EventDetailsModal } from '@/features/events/event-details-modal.tsx'
import { EventEditModal } from '@/features/events/event-edit-modal.tsx'
import { Booking, EventPrimitives } from '@/features/events/types.ts'
import { useBookingMutations } from './hooks/useBookingMutations'
import { useEventMutations } from './hooks/useEventMutations'

interface EventCalendarViewProps {
  events: EventPrimitives[]
  bookings: Booking[]
}

export function EventCalendarView({
  events,
  bookings,
}: EventCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [selectedEvent, setSelectedEvent] = useState<EventPrimitives | null>(
    null
  )
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const [showBooking, setShowBooking] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [showBookingDeleteDialog, setShowBookingDeleteDialog] =
    useState<boolean>(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  )
  const [showCreateEventModal, setShowCreateEventModal] =
    useState<boolean>(false)

  const { updateEvent, deleteEvent } = useEventMutations()
  const { createBooking, updateBooking, deleteBooking } = useBookingMutations()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const nextMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    )
  }

  const prevMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    )
  }

  const onDateClick = (day: Date): void => {
    setSelectedDate(day)
    setShowCreateEventModal(true)
  }

  const getFormattedMonthName = (): string => {
    const monthName = format(currentDate, 'MMMM yyyy', { locale: es })
    return monthName.charAt(0).toUpperCase() + monthName.slice(1)
  }

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

  const handleRemoveBooking = async (bookingId: Booking['id']) => {
    setSelectedBookingId(bookingId)
    setShowBookingDeleteDialog(true)
  }

  const handleEditedEvent = (changes: Partial<EventPrimitives>) => {
    if (!selectedEvent) return
    updateEvent(selectedEvent.id, changes)
    setShowEdit(false)
    setSelectedEvent(null)
  }

  const handleBookingEvent = async ({
    clientId,
    date,
    participants,
    notes,
    status,
    amount,
    paymentStatus,
  }: {
    clientId: string
    date: Date
    participants: number
    notes?: string
    status?: string
    amount?: number
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
      paymentStatus: paymentStatus || 'pendiente',
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
      <div className='flex items-center justify-between mb-4 bg-background z-10 py-2'>
        <Button variant='outline' onClick={prevMonth}>
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <h2 className='text-xl font-semibold capitalize'>
          {getFormattedMonthName()}
        </h2>
        <Button variant='outline' onClick={nextMonth}>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  const renderDays = (): JSX.Element => {
    const weekDays: JSX.Element[] = []
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    for (let i = 0; i < 7; i++) {
      weekDays.push(
        <div key={i} className='text-center font-medium py-2'>
          {days[i]}
        </div>
      )
    }

    return (
      <div className='grid grid-cols-7 mb-2 bg-background z-10'>{weekDays}</div>
    )
  }

  const renderEventItem = (event: EventPrimitives, currentDay: Date) => {
    const eventStart = parseISO(event.duration.startAt)
    const eventEnd = parseISO(event.duration.endAt)

    const isFirstDay = isSameDay(eventStart, currentDay)
    const isLastDay = isSameDay(eventEnd, currentDay)
    const isMultiDayEvent = !isSameDay(eventStart, eventEnd)
    const timeDisplay = isFirstDay ? format(eventStart, 'HH:mm') : ''
    let eventIndicator = ''
    let eventClasses = ''
    if (isMultiDayEvent) {
      if (!isFirstDay && !isLastDay) {
        eventIndicator = '… '
        eventClasses = 'bg-secondary/90'
      } else if (!isFirstDay && isLastDay) {
        eventIndicator = '✔ '
        eventClasses = 'bg-secondary/90'
      } else if (isFirstDay && !isLastDay) {
        eventIndicator = '→ '
        eventClasses = 'bg-secondary'
      }
    }

    return (
      <DropdownMenu key={event.id}>
        <DropdownMenuTrigger asChild>
          <div
            className={`text-xs p-1 truncate cursor-pointer hover:opacity-90 flex items-center gap-1 ${eventClasses || 'bg-secondary'} ${isMultiDayEvent ? 'border-l-2 border-primary' : ''} ${isFirstDay ? 'rounded-l' : ''} ${isLastDay ? 'rounded-r' : ''} ${!isFirstDay && !isLastDay ? '' : 'rounded'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {timeDisplay && <span className='font-medium'>{timeDisplay}</span>}
            <span className='truncate flex-1'>
              {eventIndicator}
              {event.name}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              openEventDetails(event)
            }}
          >
            Ver detalles
          </DropdownMenuItem>
          <RenderIfCan permission={PERMISSIONS.EVENT_UPDATE}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                openEventEdit(event)
              }}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                openEventBooking(event)
              }}
            >
              Agendar
            </DropdownMenuItem>
          </RenderIfCan>
          <RenderIfCan permission={PERMISSIONS.EVENT_DELETE}>
            <DropdownMenuItem
              className='text-destructive'
              onClick={(e) => {
                e.stopPropagation()
                openDeleteDialog(event)
              }}
            >
              Eliminar Evento
            </DropdownMenuItem>
          </RenderIfCan>
        </DropdownMenuContent>
      </DropdownMenu>
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

        const currentDay = day
        const dayEvents = events.filter((event) => {
          const eventStartDate = parseISO(event.duration.startAt)
          const eventEndDate = parseISO(event.duration.endAt)

          const dayOnly = new Date(
            currentDay.getFullYear(),
            currentDay.getMonth(),
            currentDay.getDate()
          )
          const startOnly = new Date(
            eventStartDate.getFullYear(),
            eventStartDate.getMonth(),
            eventStartDate.getDate()
          )
          const endOnly = new Date(
            eventEndDate.getFullYear(),
            eventEndDate.getMonth(),
            eventEndDate.getDate()
          )
          return dayOnly >= startOnly && dayOnly <= endOnly
        })

        const isCurrentMonth = isSameMonth(day, monthStart)
        const isToday = isSameDay(day, new Date())
        const isSelected = selectedDate && isSameDay(day, selectedDate)

        days.push(
          <div
            key={currentDay.toString()}
            className={`min-h-24 p-1 border relative ${
              !isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : ''
            } ${isToday ? 'bg-primary/10' : ''} ${
              isSelected ? 'border-primary border-2' : ''
            }`}
            onClick={() => onDateClick(currentDay)}
          >
            <div className='h-6 flex justify-end'>
              <span
                className={`text-sm rounded-full h-6 w-6 flex items-center justify-center ${
                  isToday ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {formattedDate}
              </span>
            </div>

            {dayEvents.length > 0 && (
              <div className='space-y-1'>
                {dayEvents.map((event) => renderEventItem(event, currentDay))}
              </div>
            )}
          </div>
        )

        day = addDays(day, 1)
      }

      rows.push(
        <div key={day.toString()} className='grid grid-cols-7'>
          {days}
        </div>
      )

      days = []
    }

    return <div className='border rounded-lg overflow-hidden'>{rows}</div>
  }

  return (
    <div className='flex flex-col'>
      <div className='px-1'>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

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

          <RenderIfCan permission={PERMISSIONS.EVENT_UPDATE}>
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
          </RenderIfCan>
          <RenderIfCan permission={PERMISSIONS.EVENT_DELETE}>
            <EventDeleteDialog
              open={showDeleteDialog}
              onClose={() => {
                setShowDeleteDialog(false)
                setSelectedEvent(null)
              }}
              onConfirm={handleDeleteEvent}
            />
          </RenderIfCan>
        </>
      )}

      <BookingDeleteDialog
        open={showBookingDeleteDialog}
        onClose={() => setShowBookingDeleteDialog(false)}
        onConfirm={confirmBookingDeletion}
      />

      <RenderIfCan permission={PERMISSIONS.EVENT_CREATE}>
        <EventCreateModal
          open={showCreateEventModal}
          onClose={() => {
            setShowCreateEventModal(false)
            setSelectedDate(null)
          }}
          defaultDate={selectedDate || undefined}
        />
      </RenderIfCan>
    </div>
  )
}

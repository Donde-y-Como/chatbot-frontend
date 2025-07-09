import { useEffect, useMemo, useState } from 'react'
import { format, isSameDay, parseISO, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useGetEventAvailableDates } from '@/features/events/hooks/useGetEventAvailableDates.ts'
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings.ts'
import { Booking } from '@/features/events/types.ts'
import { CartItemRequest } from '@/features/store/types.ts'

export function SelectEventDateDialog({
  item,
  onSubmit,
  onClose,
}: {
  item: CartItemRequest
  onSubmit: (item: CartItemRequest) => Promise<void>
  onClose: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [participants, setParticipants] = useState(1)
  const { data: event, isLoading: isEventLoading } = useGetEventWithBookings(
    item.itemId
  )
  const availableDates = useGetEventAvailableDates(event)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (availableDates.length && !selectedDate) {
      setSelectedDate(availableDates[0])
    }
  }, [availableDates, selectedDate])

  const bookingsForSelectedDate = useMemo(() => {
    if (
      !event ||
      !selectedDate ||
      !event.bookings ||
      !Array.isArray(event.bookings)
    ) {
      return [] as Booking[]
    }
    return event.bookings.filter((booking: Booking) =>
      isSameDay(startOfDay(parseISO(booking.date)), selectedDate)
    )
  }, [event, selectedDate])

  // Helper functions for booking statistics
  const getBookingStats = useMemo(() => {
    const confirmedBookings = bookingsForSelectedDate.filter(
      (b) => b.status === 'confirmada'
    )
    const pendingBookings = bookingsForSelectedDate.filter(
      (b) => b.status === 'pendiente'
    )
    const activeBookings = bookingsForSelectedDate.filter((b) =>
      ['confirmada', 'pendiente', 'reprogramada'].includes(b.status)
    )

    return {
      confirmed: {
        count: confirmedBookings.length,
        participants: confirmedBookings.reduce(
          (sum, b) => sum + b.participants,
          0
        ),
      },
      pending: {
        count: pendingBookings.length,
        participants: pendingBookings.reduce(
          (sum, b) => sum + b.participants,
          0
        ),
      },
      active: {
        count: activeBookings.length,
        participants: activeBookings.reduce(
          (sum, b) => sum + b.participants,
          0
        ),
      },
      total: {
        count: bookingsForSelectedDate.length,
        participants: bookingsForSelectedDate.reduce(
          (sum, b) => sum + b.participants,
          0
        ),
      },
    }
  }, [bookingsForSelectedDate])

  if (isEventLoading || !event) {
    return (
      <Dialog
        open={!!item}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent className='sm:max-w-[600px]'>
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const reset = () => {
    setParticipants(1)
    setSelectedDate(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    if (!selectedDate) {
      toast.warning('Elige una fecha para continuar')
      return
    }

    if (participants <= 0) {
      toast.warning('Al menos un participante es requerido')
      return
    }

    if (event.capacity.isLimited && event.capacity.maxCapacity) {
      const currentParticipants = bookingsForSelectedDate.reduce(
        (sum, booking) => sum + booking.participants,
        0
      )
      const totalAfterBooking = currentParticipants + participants

      if (totalAfterBooking > event.capacity.maxCapacity) {
        const availableSpots = event.capacity.maxCapacity - currentParticipants
        toast.error(
          availableSpots > 0
            ? `No hay suficientes espacios disponibles. Solo quedan ${availableSpots} lugar${availableSpots !== 1 ? 'es' : ''} disponible${availableSpots !== 1 ? 's' : ''} para esta fecha.`
            : 'No hay espacios disponibles para esta fecha.'
        )
        return
      }
    }

    try {
      const bookingItemRequest = {
        quantity: participants,
        itemId: event.id,
        itemType: 'event',
        eventDate: selectedDate.toISOString(),
      } satisfies CartItemRequest

      await onSubmit(bookingItemRequest)
      toast.success('Reserva provisional agendada con éxito')
      onClose()

      reset()
    } catch (error) {
      toast.error('Parece que ocurrio un error, intenta mas tarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className='sm:max-w-[700px] max-h-[95vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Seleccionar fecha para evento {event?.name}</DialogTitle>
          <DialogDescription>
            {selectedDate
              ? format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })
              : ''}
          </DialogDescription>

          <div className='mt-4 p-4 bg-muted/50 rounded-lg border'>
            <div className='flex items-center justify-between mb-2'>
              <h4 className='font-medium text-sm'>Información del Evento</h4>
              {event.capacity?.isLimited ? (
                <Badge
                  variant={
                    getBookingStats.total.participants >=
                    (event.capacity.maxCapacity || 0)
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {event.capacity.isLimited && event.capacity.maxCapacity
                    ? `${getBookingStats.total.participants}/${event.capacity.maxCapacity} asistentes`
                    : `${getBookingStats.total.participants} asistentes`}
                </Badge>
              ) : (
                <Badge variant='outline'>
                  {getBookingStats.total.participants} asistentes • Sin límite
                </Badge>
              )}
            </div>

            {event.capacity?.isLimited && event.capacity.maxCapacity ? (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Capacidad total:</span>
                  <span className='font-medium'>
                    {event.capacity.maxCapacity} personas
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Reservas confirmadas:</span>
                  <span className='font-medium text-green-600'>
                    {getBookingStats.confirmed.participants} personas
                  </span>
                </div>
                {getBookingStats.pending.participants > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span>Reservas pendientes:</span>
                    <span className='font-medium text-yellow-600'>
                      {getBookingStats.pending.participants} personas
                    </span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span>Espacios disponibles:</span>
                  <span
                    className={`font-medium ${
                      event.capacity.maxCapacity -
                        getBookingStats.total.participants >
                      0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {Math.max(
                      0,
                      event.capacity.maxCapacity -
                        getBookingStats.total.participants
                    )}{' '}
                    personas
                  </span>
                </div>

                {/* Visual capacity bar */}
                <div className='w-full bg-gray-200 rounded-full h-2 mt-3'>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getBookingStats.total.participants >=
                      event.capacity.maxCapacity
                        ? 'bg-red-500'
                        : getBookingStats.total.participants /
                              event.capacity.maxCapacity >
                            0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (getBookingStats.total.participants / event.capacity.maxCapacity) * 100)}%`,
                    }}
                  />
                </div>
                <div className='text-xs text-muted-foreground text-center'>
                  {(
                    (getBookingStats.total.participants /
                      event.capacity.maxCapacity) *
                    100
                  ).toFixed(0)}
                  % ocupado
                </div>

                {/* Booking breakdown */}
                <div className='pt-2 border-t border-muted-foreground/10'>
                  <div className='text-xs text-muted-foreground space-y-1'>
                    <div>
                      Total de reservas: {getBookingStats.total.count} (
                      {getBookingStats.total.participants} asistentes)
                    </div>
                    <div className='flex gap-4'>
                      <span>
                        • Confirmadas: {getBookingStats.confirmed.count} (
                        {getBookingStats.confirmed.participants}p)
                      </span>
                      <span>
                        • Pendientes: {getBookingStats.pending.count} (
                        {getBookingStats.pending.participants}p)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='text-sm text-muted-foreground'>
                  Este evento no tiene límite de capacidad
                </div>
                <div className='text-xs text-muted-foreground'>
                  Total de reservas: {getBookingStats.total.count} (
                  {getBookingStats.total.participants} asistentes)
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Occurrence Date Selector */}
          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Selecciona una fecha:</label>
            <Select
              value={selectedDate?.toISOString()}
              onValueChange={(value) => setSelectedDate(new Date(value))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Fecha' />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem
                    key={date.toISOString()}
                    value={date.toISOString()}
                  >
                    {format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Booking Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='flex flex-col gap-2'>
              <label className='font-medium'>Número de Participantes</label>
            </div>

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {isSubmitting ? 'Guardando...' : 'Agregar Reserva a orden'}
            </Button>
          </form>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

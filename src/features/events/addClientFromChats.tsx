import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { es } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateOrSelectClient } from '@/features/appointments/components/CreateOrSelectClient'
import { useGetClients } from '@/features/clients/hooks/useGetClients'
import { useEventMutations } from './hooks/useEventMutations'
import { useGetEventAvailableDates } from './hooks/useGetEventAvailableDates'
import { useGetEventWithBookings } from './hooks/useGetEventWithBookings'
import { useGetEvents } from './hooks/useGetEvents'

const bookingFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Debes seleccionar un cliente.' }),
  eventId: z.string().min(1, { message: 'Debes seleccionar un evento.' }),
  participants: z
    .number({ invalid_type_error: 'El número de participantes es requerido.' })
    .min(1, { message: 'Mínimo 1 participante.' }),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

interface AddClientFromChatsProps {
  open: boolean
  onClose: () => void
  preselectedClientId?: string
  title?: string
}

const useAddClientFromChatsLogic = ({
  open,
  preselectedClientId,
}: {
  open: boolean
  preselectedClientId?: string
}) => {
  const { data: events, isLoading: isEventsLoading } = useGetEvents()
  const { data: clients } = useGetClients()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const { data: selectedEvent, isLoading: isEventLoading } =
    useGetEventWithBookings(selectedEventId || '')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [clientId, setClientId] = useState(preselectedClientId || '')

  const { bookEvent } = useEventMutations()
  const availableDates = useGetEventAvailableDates(selectedEvent)

  const preselectedClient = useMemo(
    () =>
      preselectedClientId
        ? clients?.find((client) => client.id === preselectedClientId)
        : null,
    [preselectedClientId, clients]
  )

  const filteredDates = useMemo(() => {
    return availableDates.filter((date) => {
      if (!date || isNaN(date.getTime())) return false

      try {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        return date >= now
      } catch (e) {
        console.error('Error comparando fechas:', e)
        return false
      }
    })
  }, [availableDates])

  const isLoading = isEventsLoading || (selectedEventId && isEventLoading)

  return {
    events,
    clients,
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
    selectedDate,
    setSelectedDate,
    clientId,
    setClientId,
    preselectedClient,
    availableDates,
    filteredDates,
    bookEvent,
    isLoading,
  }
}

export function AddClientFromChats({
  open,
  onClose,
  preselectedClientId,
  title = 'Agendar Cliente en Evento',
}: AddClientFromChatsProps) {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    selectedDate,
    setSelectedDate,
    clientId,
    setClientId,
    preselectedClient,
    filteredDates,
    bookEvent,
    isLoading,
  } = useAddClientFromChatsLogic({ open, preselectedClientId })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: preselectedClientId || '',
      eventId: '',
      participants: 1,
    },
  })

  const resetForm = useCallback(() => {
    reset({ clientId: preselectedClientId || '', eventId: '', participants: 1 })
    setSelectedEventId('')
    setSelectedDate(null)
    if (!preselectedClientId) {
      setClientId('')
    }
  }, [
    reset,
    preselectedClientId,
    setSelectedEventId,
    setSelectedDate,
    setClientId,
  ])

  useEffect(() => {
    if (clientId) setValue('clientId', clientId)
  }, [clientId, setValue])

  useEffect(() => {
    if (selectedEventId) setValue('eventId', selectedEventId)
  }, [selectedEventId, setValue])

  useEffect(() => {
    if (filteredDates.length && !selectedDate) {
      setSelectedDate(filteredDates[0])
    }
  }, [filteredDates, selectedDate, setSelectedDate])

  useEffect(() => {
    if (!open) {
      resetForm()
    } else if (preselectedClientId) {
      setClientId(preselectedClientId)
    }
  }, [open, resetForm, preselectedClientId, setClientId])

  const onSubmit = useCallback(
    async (data: BookingFormValues) => {
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        console.error('Fecha inválida al intentar agendar evento')
        return
      }

      try {
        await bookEvent({
          eventId: data.eventId,
          clientId: data.clientId,
          date: selectedDate,
          participants: data.participants,
          notes: '',
        })

        onClose()
        resetForm()
      } catch (error) {
        console.error('Error al agendar evento:', error)
      }
    },
    [selectedDate, bookEvent, onClose, resetForm]
  )

  const handleEventChange = useCallback(
    (value: string) => {
      setValue('eventId', value)
      setSelectedEventId(value)
      setSelectedDate(null)
    },
    [setValue, setSelectedEventId, setSelectedDate]
  )

  const handleDateChange = useCallback(
    (value: string) => {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          setSelectedDate(date)
        }
      } catch (error) {
        console.error('Error parsing date:', error)
      }
    },
    [setSelectedDate]
  )

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[600px]'>
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {selectedDate && !isNaN(selectedDate.getTime())
              ? format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })
              : 'Selecciona un evento y una fecha disponible'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Selección o creación de cliente */}
          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Cliente</label>
            <Controller
              control={control}
              name='clientId'
              render={() => (
                <>
                  {preselectedClientId && preselectedClient ? (
                    <div className='flex items-center gap-3 p-3 border rounded-md bg-muted/50'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={preselectedClient.photo}
                          alt={preselectedClient.name}
                          className='object-cover'
                        />
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {preselectedClient.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <p className='font-medium'>{preselectedClient.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          Cliente seleccionado desde el chat
                        </p>
                      </div>
                    </div>
                  ) : (
                    <CreateOrSelectClient
                      value={clientId}
                      onChange={setClientId}
                    />
                  )}
                  {errors.clientId && (
                    <p className='text-sm text-red-600'>
                      {errors.clientId.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Selector de eventos */}
          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Evento</label>
            <Controller
              control={control}
              name='eventId'
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleEventChange(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona un evento' />
                  </SelectTrigger>
                  <SelectContent>
                    {events?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventId && (
              <p className='text-sm text-red-600'>{errors.eventId.message}</p>
            )}
          </div>

          {/* Número de participantes */}
          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Número de Participantes</label>
            <Controller
              control={control}
              name='participants'
              render={({ field }) => (
                <Input
                  {...field}
                  type='number'
                  min={1}
                  className='w-full'
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.participants && (
              <p className='text-sm text-red-600'>
                {errors.participants.message}
              </p>
            )}
          </div>

          {/* Selector de fechas disponibles (se muestra solo si hay un evento seleccionado) */}
          {selectedEventId && (
            <div className='flex flex-col gap-2'>
              <label className='font-medium'>Fecha</label>
              <Select
                value={
                  selectedDate && !isNaN(selectedDate.getTime())
                    ? selectedDate.toISOString()
                    : ''
                }
                onValueChange={handleDateChange}
                disabled={filteredDates.length === 0}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue
                    placeholder={
                      filteredDates.length === 0
                        ? 'No hay fechas disponibles'
                        : 'Selecciona una fecha'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredDates.map((date) => {
                    try {
                      const isoString = date.toISOString()
                      return (
                        <SelectItem key={date.getTime()} value={isoString}>
                          {format(date, "EEEE, d 'de' MMMM yyyy", {
                            locale: es,
                          })}
                        </SelectItem>
                      )
                    } catch (error) {
                      console.error('Error al renderizar fecha:', error, date)
                      return null
                    }
                  })}
                </SelectContent>
              </Select>
              {filteredDates.length === 0 && selectedEventId && (
                <p className='text-sm text-amber-600'>
                  Este evento no tiene fechas futuras disponibles.
                </p>
              )}
            </div>
          )}

          <DialogFooter className='pt-4'>
            <Button
              variant='outline'
              type='button'
              onClick={onClose}
              className='mr-2'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={
                !selectedDate ||
                isNaN(selectedDate?.getTime?.()) ||
                !selectedEventId ||
                !clientId
              }
            >
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

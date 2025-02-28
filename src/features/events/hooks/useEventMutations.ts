import { EventApiService } from '@/features/events/EventApiService.ts'
import { CreatableEvent, EventPrimitives, EventWithBookings } from '@/features/events/types.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fromZonedTime } from 'date-fns-tz'
import { toast } from 'sonner'

export function useEventMutations() {
    const queryClient = useQueryClient()

    const bookEventMutation = useMutation({
        mutationKey: ['bookEvent'],
        mutationFn: async (variables: {
            eventId: string
            date: string
            clientId: string,
            participants: number,
            notes: string
        }) => {
            await EventApiService.bookEvent(variables)

        },
        onSuccess: (_data, variables) => {
            toast.success('Cliente agendado correctamente al evento')
            void queryClient.refetchQueries({ queryKey: ['events'] })
            void queryClient.refetchQueries({ queryKey: ['event', variables.eventId] })
            void queryClient.refetchQueries({ queryKey: ['bookings'] })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Hubo un error al agendar cliente al evento')
        },
    })

    const createEventMutation = useMutation({
        mutationKey: ['createEvent'],
        mutationFn: async (variables: { event: CreatableEvent }) => {
            await EventApiService.createEvent(variables.event)
        },
        onSuccess: () => {
            toast.success('Evento creado correctamente')
            void queryClient.refetchQueries({ queryKey: ['events'] })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Hubo un error al crear el evento')
        },
    })

    const updateEventMutation = useMutation({
        mutationKey: ['updateEvent'],
        mutationFn: async ({ eventId, changes }: { eventId: string, changes: Partial<EventPrimitives> }) => {
            await EventApiService.updateEvent(eventId, changes)
        },
        onSuccess: (_data, { eventId, changes }) => {
            toast.success('Evento actualizado correctamente')

            // Update events list cache
            queryClient.setQueryData<EventPrimitives[]>(['events'], (oldEvents) => {
                if (!oldEvents) return oldEvents

                return oldEvents.map((existingEvent) =>
                    existingEvent.id === eventId
                        ? { ...existingEvent, ...changes }
                        : existingEvent
                )
            })

            // Update single event cache
            queryClient.setQueryData<EventWithBookings>(
                ['event', eventId],
                (oldEvent) => {
                    if (!oldEvent) return oldEvent

                    return { ...oldEvent, ...changes }
                }
            )
        },
        onError: (error) => {
            console.log(error)
            toast.error('Hubo un error al actualizar el evento')
        },
    })

    const deleteBookingMutation = useMutation({
        mutationKey: ['deleteBooking'],
        mutationFn: async (variables: { bookingId: string, eventId: string }) => {
            await EventApiService.cancelBooking(variables.bookingId)
        },
        onSuccess: (_data, variables) => {
            toast.success('Reservación cancelada correctamente')
            void queryClient.refetchQueries({ queryKey: ['events'] })
            void queryClient.refetchQueries({ queryKey: ['event', variables.eventId] })
            void queryClient.refetchQueries({ queryKey: ['bookings'] })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Hubo un error al cancelar la reservación')
        }
    })

    const deleteEventMutation = useMutation({
        mutationKey: ['deleteEvent'],
        mutationFn: async (eventId: string) => {
            await EventApiService.deleteEvent(eventId)
        },
        onSuccess: (_data, eventId) => {
            toast.success('Evento eliminado correctamente')

            // Update events list cache
            queryClient.setQueryData<EventPrimitives[]>(['events'], (oldEvents) => {
                if (!oldEvents) return oldEvents
                return oldEvents.filter(event => event.id !== eventId)
            })

            // Remove the single event from cache
            queryClient.removeQueries({ queryKey: ['event', eventId] })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Hubo un error al eliminar el evento')
        }
    })

    const bookEvent = async ({
        eventId,
        clientId,
        date,
        participants,
        notes = ''
    }: {
        eventId: string,
        clientId: string,
        date: Date,
        participants: number,
        notes?: string
    }) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const utcDate = fromZonedTime(date, timeZone)

        bookEventMutation.mutate({
            eventId,
            clientId,
            participants,
            notes,
            date: utcDate.toISOString(),
        })
    }

    const createEvent = (event: Omit<EventPrimitives, 'id' | 'businessId'>) => {
        createEventMutation.mutate({ event });
    }

    const updateEvent = (eventId: string, changes: Partial<EventPrimitives>) => {
        updateEventMutation.mutate({ eventId, changes })
    }

    const deleteBooking = ({ bookingId, eventId }: { bookingId: string; eventId: string }) => {
        deleteBookingMutation.mutate({ bookingId, eventId })
    }

    const deleteEvent = (eventId: string) => {
        deleteEventMutation.mutate(eventId)
    }

    return {
        bookEvent,
        createEvent,
        updateEvent,
        deleteBooking,
        deleteEvent,

        bookEventMutation,
        createEventMutation,
        updateEventMutation,
        deleteBookingMutation,
        deleteEventMutation
    }
}
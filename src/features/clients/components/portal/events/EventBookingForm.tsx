import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useClientPortalEvents,
  useClientPortalEventBooking,
  PortalEvent,
  EventBookingRequest
} from '../../../hooks/portal'
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  PartyPopper
} from 'lucide-react'

interface EventBookingFormProps {
  clientId: string
  token: string
  isForOther: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function EventBookingForm({ clientId, token, isForOther, onSuccess, onCancel }: EventBookingFormProps) {
  const [selectedEvent, setSelectedEvent] = useState<PortalEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [participants, setParticipants] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  const [clientForName, setClientForName] = useState<string>('')
  const [clientForPhone, setClientForPhone] = useState<string>('')

  const { data: events, isLoading: eventsLoading } = useClientPortalEvents(
    clientId,
    token,
    true
  )

  const eventBookingMutation = useClientPortalEventBooking(clientId, token)

  const handleEventSelect = (event: PortalEvent) => {
    setSelectedEvent(event)
    setSelectedDate('')
    setParticipants(1)
  }

  const handleSubmit = async () => {
    if (!selectedEvent || !selectedDate || participants < 1) {
      return
    }

    const booking: EventBookingRequest = {
      eventId: selectedEvent.id,
      date: selectedDate,
      participants,
      notes: notes.trim() || undefined
    }

    if (isForOther && clientForName.trim()) {
      booking.clientForId = clientForName.trim() // Simplified for demo
    }

    try {
      const result = await eventBookingMutation.mutateAsync(booking)
      if (result.success) {
        onSuccess()
      }
    } catch (error) {
      // Error handling is done by the mutation
    }
  }

  const canSubmit = selectedEvent && selectedDate && participants >= 1 &&
    (!isForOther || clientForName.trim())

  const maxParticipants = selectedEvent?.capacity.isLimited ? selectedEvent.capacity.maxCapacity : 50

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando eventos...</span>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No hay eventos disponibles</p>
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {eventBookingMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">¡Evento reservado exitosamente!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {eventBookingMutation.isError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <span>{eventBookingMutation.error?.message || 'Error al reservar evento'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select Event */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-sm font-semibold">1</span>
            <span>Selecciona un evento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className={`cursor-pointer transition-all ${
                  selectedEvent?.id === event.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleEventSelect(event)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {event.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>{event.price.amount} {event.price.currency}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{event.availableDates.length} fechas disponibles</span>
                          </div>
                          {event.capacity.isLimited && (
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>Máximo {event.capacity.maxCapacity} personas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedEvent?.id === event.id && (
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select Date */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-sm font-semibold">2</span>
              <span>Selecciona una fecha</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              {selectedEvent.availableDates.map((date) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? 'default' : 'outline'}
                  className="h-auto p-4 flex flex-col items-center space-y-1"
                  onClick={() => setSelectedDate(date)}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short'
                    })}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Participants and Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-sm font-semibold">3</span>
              <span>Detalles de la reserva</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Número de participantes *
              </label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setParticipants(Math.max(1, participants - 1))}
                  disabled={participants <= 1}
                >
                  -
                </Button>
                <span className="font-semibold min-w-[3rem] text-center">{participants}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setParticipants(Math.min(maxParticipants || 50, participants + 1))}
                  disabled={maxParticipants ? participants >= maxParticipants : false}
                >
                  +
                </Button>
                {maxParticipants && (
                  <span className="text-sm text-gray-500">
                    (máximo {maxParticipants})
                  </span>
                )}
              </div>
            </div>

            {isForOther && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre de la persona *
                  </label>
                  <Input
                    value={clientForName}
                    onChange={(e) => setClientForName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teléfono (opcional)
                  </label>
                  <Input
                    value={clientForPhone}
                    onChange={(e) => setClientForPhone(e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Notas adicionales (opcional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cualquier información adicional..."
                className="h-24"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary and Actions */}
      {canSubmit && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-300">
              Resumen de la reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Evento:</strong> {selectedEvent?.name}
              </div>
              <div>
                <strong>Fecha:</strong> {
                  new Date(selectedDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })
                }
              </div>
              <div>
                <strong>Participantes:</strong> {participants}
              </div>
              <div>
                <strong>Ubicación:</strong> {selectedEvent?.location}
              </div>
              {isForOther && clientForName && (
                <div>
                  <strong>Para:</strong> {clientForName}
                </div>
              )}
              <div>
                <strong>Costo total:</strong> {
                  selectedEvent ? (selectedEvent.price.amount * participants) : 0
                } {selectedEvent?.price.currency}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={eventBookingMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || eventBookingMutation.isPending}
          className="flex-1"
        >
          {eventBookingMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Reservando...
            </>
          ) : (
            <>
              <PartyPopper className="h-4 w-4 mr-2" />
              Confirmar reserva
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
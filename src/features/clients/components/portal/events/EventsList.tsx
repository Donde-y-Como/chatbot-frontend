import { useClientPortalEvents } from '../../../hooks/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PartyPopper, MapPin, DollarSign, Calendar, Loader2 } from 'lucide-react'

interface EventsListProps {
  clientId: string
  token: string
  onBookEvent: () => void
}

export function EventsList({ clientId, token, onBookEvent }: EventsListProps) {
  const { data: events, isLoading } = useClientPortalEvents(clientId, token, true)

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PartyPopper className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span>Eventos Disponibles</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando eventos...</span>
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm mb-2">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{event.price.amount} {event.price.currency}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {event.availableDates.length} fechas disponibles
                      </p>
                    </div>
                    <Button size="sm" onClick={onBookEvent}>
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <PartyPopper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hay eventos disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
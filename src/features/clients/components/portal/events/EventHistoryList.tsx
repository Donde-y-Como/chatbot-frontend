import { useClientPortalEventBookingHistory } from '../../../hooks/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, DollarSign, Loader2 } from 'lucide-react'

interface EventHistoryListProps {
  clientId: string
  token: string
}

export function EventHistoryList({ clientId, token }: EventHistoryListProps) {
  const { data: eventHistory, isLoading } = useClientPortalEventBookingHistory(clientId, token, true)

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span>Mis Reservas de Eventos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando reservas...</span>
          </div>
        ) : eventHistory && eventHistory.length > 0 ? (
          <div className="space-y-4">
            {eventHistory.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{booking.eventName}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{booking.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{booking.participants} participantes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{booking.amount}</span>
                        </span>
                      </div>
                      {booking.clientForName && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Reservado para: {booking.clientForName}
                        </p>
                      )}
                    </div>
                    <Badge variant={booking.status === 'confirmada' ? 'default' : 'outline'}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No tienes reservas de eventos</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
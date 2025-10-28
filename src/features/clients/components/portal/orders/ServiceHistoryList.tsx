import { useClientPortalServicesHistory } from '../../../hooks/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, DollarSign, Loader2 } from 'lucide-react'

interface ServiceHistoryListProps {
  clientId: string
  token: string
}

export function ServiceHistoryList({ clientId, token }: ServiceHistoryListProps) {
  const { data: servicesHistory, isLoading } = useClientPortalServicesHistory(clientId, token, true)

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>Historial de Servicios</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando historial...</span>
          </div>
        ) : servicesHistory && servicesHistory.length > 0 ? (
          <div className="space-y-4">
            {servicesHistory.map((service) => (
              <div key={service.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{service.service}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Por {service.employee}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{service.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{service.amount} {service.currency}</span>
                      </span>
                    </div>
                  </div>
                  <Badge variant={service.status === 'paid' ? 'default' : 'outline'}>
                    {service.status === 'completed' ? 'Completado' :
                     service.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </div>
                {service.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Notas:</strong> {service.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hay servicios en tu historial</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
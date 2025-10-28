import { useClientPortalOrderableServices } from '../../../hooks/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Clock, DollarSign, Loader2 } from 'lucide-react'

interface OrderableServicesListProps {
  clientId: string
  token: string
  onCreateOrder: () => void
}

export function OrderableServicesList({ clientId, token, onCreateOrder }: OrderableServicesListProps) {
  const { data: orderableServices, isLoading } = useClientPortalOrderableServices(clientId, token, true)

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span>Servicios Disponibles</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando servicios...</span>
          </div>
        ) : orderableServices && orderableServices.length > 0 ? (
          <div className="space-y-4">
            {orderableServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration.value} {service.duration.unit}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{service.price.amount} {service.price.currency}</span>
                        </span>
                      </div>
                    </div>
                    <Button size="sm" onClick={onCreateOrder}>
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hay servicios disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
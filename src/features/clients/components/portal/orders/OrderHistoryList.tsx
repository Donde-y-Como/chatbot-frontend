import { useClientPortalOrderHistory } from '../../../hooks/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, DollarSign, Loader2 } from 'lucide-react'

interface OrderHistoryListProps {
  clientId: string
  token: string
}

export function OrderHistoryList({ clientId, token }: OrderHistoryListProps) {
  const { data: orderHistory, isLoading } = useClientPortalOrderHistory(clientId, token, true)

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <span>Mis Órdenes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando órdenes...</span>
          </div>
        ) : orderHistory && orderHistory.length > 0 ? (
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{order.createdAt}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{order.totalAmount} {order.currency}</span>
                        </span>
                      </div>
                      {order.clientForName && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                          Pedido para: {order.clientForName}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={order.status === 'completada' ? 'default' : 'outline'}>
                        {order.status}
                      </Badge>
                      <Badge variant={order.paymentStatus === 'pagado' ? 'default' : 'outline'}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm">Servicios:</h5>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.serviceName} x {item.quantity}</span>
                        <span>{item.totalPrice} {order.currency}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No tienes órdenes registradas</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
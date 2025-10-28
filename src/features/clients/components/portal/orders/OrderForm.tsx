import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useClientPortalOrderableServices,
  useClientPortalCreateOrder,
  PortalService,
  OrderRequest,
  OrderItem
} from '../../../hooks/portal'
import {
  ShoppingCart,
  Plus,
  Minus,
  DollarSign,
  User,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Trash2
} from 'lucide-react'

interface OrderFormProps {
  clientId: string
  token: string
  isForOther: boolean
  onSuccess: () => void
  onCancel: () => void
}

interface CartItem extends OrderItem {
  service: PortalService
}

export function OrderForm({ clientId, token, isForOther, onSuccess, onCancel }: OrderFormProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [notes, setNotes] = useState<string>('')
  const [clientForName, setClientForName] = useState<string>('')
  const [clientForPhone, setClientForPhone] = useState<string>('')

  const { data: services, isLoading: servicesLoading } = useClientPortalOrderableServices(
    clientId,
    token,
    true
  )

  const orderMutation = useClientPortalCreateOrder(clientId, token)

  const addToCart = (service: PortalService) => {
    const existingItem = cart.find(item => item.serviceId === service.id)

    if (existingItem) {
      setCart(cart.map(item =>
        item.serviceId === service.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        serviceId: service.id,
        quantity: 1,
        notes: '',
        service
      }])
    }
  }

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId)
      return
    }

    setCart(cart.map(item =>
      item.serviceId === serviceId
        ? { ...item, quantity }
        : item
    ))
  }

  const updateItemNotes = (serviceId: string, itemNotes: string) => {
    setCart(cart.map(item =>
      item.serviceId === serviceId
        ? { ...item, notes: itemNotes }
        : item
    ))
  }

  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter(item => item.serviceId !== serviceId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      return total + (item.service.price.amount * item.quantity)
    }, 0)
  }

  const handleSubmit = async () => {
    if (cart.length === 0) return

    const order: OrderRequest = {
      items: cart.map(item => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
        notes: item.notes || undefined
      })),
      notes: notes.trim() || undefined
    }

    if (isForOther && clientForName.trim()) {
      order.clientForId = clientForName.trim() // Simplified for demo
    }

    try {
      const result = await orderMutation.mutateAsync(order)
      if (result.success) {
        onSuccess()
      }
    } catch (error) {
      // Error handling is done by the mutation
    }
  }

  const canSubmit = cart.length > 0 && (!isForOther || clientForName.trim())

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando servicios...</span>
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No hay servicios disponibles para ordenar</p>
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {orderMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">¡Orden creada exitosamente!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {orderMutation.isError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <span>{orderMutation.error?.message || 'Error al crear la orden'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Servicios disponibles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-sm transition-shadow">
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
                            <DollarSign className="h-4 w-4" />
                            <span>{service.price.amount} {service.price.currency}</span>
                          </span>
                          {service.productInfo.sku && (
                            <Badge variant="outline" className="text-xs">
                              {service.productInfo.sku}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(service)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shopping Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <span>Carrito ({cart.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Agrega servicios para comenzar tu pedido
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.serviceId} className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold">{item.service.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.service.price.amount} {item.service.price.currency} c/u
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.serviceId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-500 ml-auto">
                            Total: {item.service.price.amount * item.quantity} {item.service.price.currency}
                          </span>
                        </div>

                        <div>
                          <Input
                            placeholder="Notas para este servicio (opcional)"
                            value={item.notes || ''}
                            onChange={(e) => updateItemNotes(item.serviceId, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Cart Total */}
                <Card className="border-cyan-200 bg-cyan-50 dark:bg-cyan-900/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total del pedido:</span>
                      <span className="text-lg font-bold text-cyan-700 dark:text-cyan-300">
                        {getTotalAmount()} {cart[0]?.service.price.currency || 'MXN'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                Notas generales del pedido (opcional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales, preferencias, etc..."
                className="h-24"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={orderMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || orderMutation.isPending}
          className="flex-1"
        >
          {orderMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creando pedido...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Confirmar pedido ({cart.length} servicios)
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
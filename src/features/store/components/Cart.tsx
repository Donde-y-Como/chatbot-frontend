import React from 'react'
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { CreateOrSelectClient } from '../../appointments/components/CreateOrSelectClient'
import { CartState, POSItem } from '../types'

interface CartProps {
  cart: CartState
  onToggle: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onClientSelect: (clientId: string) => void
}

interface CartItemCardProps {
  item: POSItem
  onRemove: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
}

function CartItemCard({ item, onRemove, onUpdateQuantity }: CartItemCardProps) {
  const formatPrice = (price: typeof item.price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency
    }).format(price.amount)
  }

  const getTypeColor = (type: typeof item.type) => {
    switch (type) {
      case 'PRODUCTOS':
        return 'bg-blue-500'
      case 'SERVICIOS':
        return 'bg-green-500'
      case 'EVENTOS':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const totalItemPrice = item.price.amount * item.quantity

  return (
    <div className="flex gap-3 p-3 border border-border rounded-lg bg-card">
      {/* Imagen miniatura */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
            <div className="text-xl text-muted-foreground/50">
              {item.type === 'PRODUCTOS' && '📦'}
              {item.type === 'SERVICIOS' && '🔧'}
              {item.type === 'EVENTOS' && '🎪'}
            </div>
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute -top-1 -right-1">
          <Badge 
            variant="secondary" 
            className={`${getTypeColor(item.type)} text-white text-xs px-1 py-0.5 scale-75`}
          >
            {item.type.substring(0, 3)}
          </Badge>
        </div>
      </div>

      {/* Información del item */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2 leading-tight">
            {item.name}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Precio unitario */}
          <div className="text-xs text-muted-foreground">
            {formatPrice(item.price)} c/u
          </div>
          
          {/* Controles de cantidad */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="h-7 w-7 p-0"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="h-7 w-7 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Precio total del item */}
        <div className="mt-1 text-right">
          <span className="font-semibold text-sm">
            {formatPrice({ amount: totalItemPrice, currency: item.price.currency })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function Cart({ 
  cart, 
  onToggle, 
  onRemoveItem, 
  onUpdateQuantity, 
  onClientSelect 
}: CartProps) {
  const formatPrice = (price: typeof cart.total) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency
    }).format(price.amount)
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Botón flotante del carrito */}
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="relative h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panel lateral del carrito */}
      <div
        className={`fixed right-0 top-0 h-full w-[35%] min-w-[400px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 z-40 ${
          cart.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del carrito */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Carrito</h2>
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Selector de cliente */}
          <div className="p-4 border-b border-border bg-card/50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Cliente
              </label>
              <CreateOrSelectClient
                value={cart.selectedClientId}
                onChange={onClientSelect}
              />
            </div>
          </div>

          {/* Lista de items en el carrito */}
          <div className="flex-1 overflow-hidden">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-6xl mb-4 text-muted-foreground/30">🛒</div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Carrito vacío
                </h3>
                <p className="text-sm text-muted-foreground">
                  Agrega productos, servicios o eventos para comenzar
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {cart.items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onRemove={onRemoveItem}
                      onUpdateQuantity={onUpdateQuantity}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer con totales */}
          {cart.items.length > 0 && (
            <div className="border-t border-border bg-card p-4 space-y-3">
              {/* Resumen de precios */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos (16%):</span>
                  <span>{formatPrice(cart.taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(cart.total)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2">
                <Button 
                  className="w-full h-12 text-base font-medium"
                  disabled={!cart.selectedClientId}
                >
                  Procesar Venta
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10"
                  onClick={() => {/* Limpiar carrito */}}
                >
                  Limpiar Carrito
                </Button>
              </div>

              {/* Mensaje de cliente requerido */}
              {!cart.selectedClientId && (
                <p className="text-xs text-muted-foreground text-center">
                  Selecciona un cliente para continuar
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {cart.isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onToggle}
        />
      )}
    </>
  )
}
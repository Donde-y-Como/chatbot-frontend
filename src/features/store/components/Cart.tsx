import React from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { CartItemCard } from '@/features/store/components/CartItemCard.tsx'
import { CreateOrSelectClient } from '../../appointments/components/CreateOrSelectClient'
import { CartState } from '../types'

interface CartProps {
  cart: CartState
  onToggle: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onUpdatePrice: (
    itemId: string,
    newPrice: { amount: number; currency: string }
  ) => void
  onClientSelect: (clientId: string) => void
  onClearCart: () => void
  onConvertCart: () => void
}

export function Cart({
  cart,
  onToggle,
  onRemoveItem,
  onUpdateQuantity,
  onUpdatePrice,
  onClientSelect,
  onClearCart,
  onConvertCart,
}: CartProps) {
  const formatPrice = (price: typeof cart.total) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Botón flotante del carrito - solo en móvil */}
      <div className='fixed right-3 bottom-3 sm:right-4 sm:bottom-4 z-50 lg:hidden'>
        <Button
          onClick={onToggle}
          size='lg'
          className='relative h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90'
        >
          <ShoppingCart className='h-5 w-5 sm:h-6 sm:w-6' />
          {totalItems > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold'
            >
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panel del carrito - siempre visible en desktop, overlay en móvil */}
      <div
        className={`
          /* Desktop: siempre visible, posición fija a la derecha */
          lg:fixed lg:right-0 lg:top-0 lg:h-full lg:w-[35%] lg:min-w-[400px] lg:max-w-[500px] lg:translate-x-0 lg:shadow-xl lg:border-l-2
          /* Móvil: panel deslizable */
          fixed right-0 top-0 h-full w-full sm:w-[90%] md:w-[70%] 
          bg-background border-l border-border transform transition-transform duration-300 z-40
          ${
            cart.isOpen
              ? 'translate-x-0 lg:translate-x-0'
              : 'translate-x-full lg:translate-x-0'
          }
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        <div className='flex flex-col h-full'>
          {/* Header del carrito */}
          <div className='flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card'>
            <div className='flex items-center gap-2'>
              <ShoppingCart className='h-4 w-4 sm:h-5 sm:w-5' />
              <h2 className='text-base sm:text-lg font-semibold'>Orden</h2>
              {totalItems > 0 && (
                <Badge variant='secondary' className='ml-2 text-xs'>
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </Badge>
              )}
            </div>
            {/* Botón cerrar - solo en móvil */}
            <Button
              variant='ghost'
              size='sm'
              onClick={onToggle}
              className='h-7 w-7 sm:h-8 sm:w-8 p-0 lg:hidden'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Selector de cliente */}
          <div className='p-3 sm:p-4 border-b border-border bg-card/50'>
            <div className='space-y-2'>
              <label className='text-xs sm:text-sm font-medium text-muted-foreground'>
                Cliente
              </label>
              <CreateOrSelectClient
                value={cart.selectedClientId}
                onChange={onClientSelect}
              />
            </div>
          </div>

          {/* Lista de items en el carrito */}
          <div className='flex-1 overflow-hidden'>
            {cart.items.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-center p-6 sm:p-8'>
                <div className='text-4xl sm:text-6xl mb-3 sm:mb-4 text-muted-foreground/30'>
                  🛒
                </div>
                <h3 className='text-base sm:text-lg font-medium text-muted-foreground mb-2'>
                  Orden vacía
                </h3>
                <p className='text-xs sm:text-sm text-muted-foreground mb-4'>
                  Agrega productos, servicios, paquetes o eventos para comenzar
                </p>
                {/* Mensaje adicional para desktop */}
                <div className='hidden lg:block'>
                  <p className='text-xs text-muted-foreground/70'>
                    La sección de orden estará siempre visible mientras navegas
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className='h-full'>
                <div className='p-3 sm:p-4 space-y-2 sm:space-y-3'>
                  {cart.items.map((item) => (
                    <CartItemCard
                      key={item.itemId}
                      item={item}
                      onRemove={onRemoveItem}
                      onUpdateQuantity={onUpdateQuantity}
                      onUpdatePrice={onUpdatePrice}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer con totales */}
          {cart.items.length > 0 && (
            <div className='border-t border-border bg-card p-3 sm:p-4 space-y-3'>
              {/* Resumen de precios */}
              <div className='space-y-1 sm:space-y-2'>
                <div className='flex justify-between text-base sm:text-lg font-semibold'>
                  <span>Total:</span>
                  <span className='text-primary'>
                    {formatPrice(cart.total)}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className='space-y-2'>
                <Button
                  className='w-full h-10 sm:h-12 text-sm sm:text-base font-medium'
                  disabled={!cart.selectedClientId}
                  onClick={onConvertCart}
                >
                  Procesar Venta
                </Button>
                <Button
                  variant='outline'
                  className='w-full h-8 sm:h-10 text-sm'
                  onClick={onClearCart}
                >
                  Limpiar Carrito
                </Button>
              </div>

              {/* Mensaje de cliente requerido */}
              {!cart.selectedClientId && (
                <p className='text-xs text-muted-foreground text-center'>
                  Selecciona un cliente para continuar
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay - solo en móvil */}
      {cart.isOpen && (
        <div
          className='fixed inset-0 bg-black/20 z-30 lg:hidden'
          onClick={onToggle}
        />
      )}
    </>
  )
}

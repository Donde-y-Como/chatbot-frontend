import React, { useState } from 'react'
import { AlertTriangle, Info, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Bundle } from '@/features/bundles/types.ts'
import { ProductStatus } from '@/features/products/types.ts'
import { BundleDetailsDialog } from '@/features/store/components/BundleDetailsDialog.tsx'
import { ItemDetailsDialog } from '@/features/store/components/ItemDetailsDialog.tsx'
import { CartItemRequest, POSItem } from '@/features/store/types.ts'

interface ItemCardProps {
  item: POSItem
  onAddToCart: (item: CartItemRequest) => void
  onDecreaseQuantity: (itemId: string) => void
}

export function ItemCard({
  item,
  onAddToCart,
  onDecreaseQuantity,
}: ItemCardProps) {
  const [showBundleDetails, setShowBundleDetails] = useState(false)
  const [showItemDetails, setShowItemDetails] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si el producto está sin stock
  const isOutOfStock =
    'status' in item.itemDetails &&
    item.itemDetails.status === ProductStatus.SIN_STOCK

  // Verificar si el producto tiene stock 0
  const hasNoStock = 'stock' in item.itemDetails && item.itemDetails.stock === 0

  const isInactive =
    ('status' in item.itemDetails &&
      item.itemDetails.status === ProductStatus.INACTIVO) ||
    ('productInfo' in item.itemDetails &&
      item.itemDetails.productInfo.status === ProductStatus.INACTIVO)

  const isDisabled = isOutOfStock || hasNoStock || isLoading

  if (isInactive) {
    return null
  }

  const handleAddToCart = async () => {
    if (isDisabled || isLoading) return
    
    setIsLoading(true)
    try {
      const quantityToAdd = quantity === 0 ? 1 : quantity
      
      const itemToAdd = {
        itemId: item.itemDetails.id,
        itemType: item.type,
        quantity: quantityToAdd,
      } satisfies CartItemRequest

      await onAddToCart(itemToAdd)
      setQuantity(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isDisabled || isLoading) return
    
    setIsLoading(true)
    try {
      await onAddToCart({
        itemId: item.itemDetails.id,
        itemType: item.type,
        quantity: 1,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isDisabled || isLoading) return

    setIsLoading(true)
    try {
      await onDecreaseQuantity(item.itemDetails.id)
    } finally {
      setIsLoading(false)
    }
  }

  const incrementQuantity = () => {
    const maxStock =
      'stock' in item.itemDetails ? item.itemDetails.stock : Infinity

    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    if (value === '') {
      setQuantity(0) 
      return
    }
    
    const numValue = parseInt(value)
    
    if (!isNaN(numValue) && numValue > 0) {
      const maxStock = 'stock' in item.itemDetails ? item.itemDetails.stock : Infinity
      
      if (numValue <= maxStock) {
        setQuantity(numValue)
      }
    }
  }

  const handleShowDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (item.type === 'bundle') {
      setShowBundleDetails(true)
    } else {
      setShowItemDetails(true)
    }
  }

  const formatPrice = (price: typeof item.itemDetails.price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }

  const getTypeColor = (type: typeof item.type) => {
    switch (type) {
      case 'product':
        return 'bg-blue-500'
      case 'bundle':
        return 'bg-orange-500'
      case 'service':
        return 'bg-green-500'
      case 'event':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <Card
        className={`group relative overflow-hidden border-2 transition-all duration-200 ${
          (isOutOfStock || hasNoStock)
            ? 'border-red-200 bg-gray-50 opacity-60'
            : isLoading
            ? 'border-primary/30 bg-primary/5'
            : 'border-transparent hover:border-primary/20 hover:shadow-lg'
        }`}
      >
        <CardContent className='p-0'>
          {/* Imagen del producto */}
          <div className='relative aspect-square overflow-hidden bg-muted group/image'>
            {'photos' in item.itemDetails ? (
              <img
                src={item.itemDetails.photos[0]}
                alt={item.itemDetails.name}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  (isOutOfStock || hasNoStock) ? 'grayscale' : 'group-hover:scale-105'
                }`}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80'>
                <div className='text-2xl sm:text-3xl md:text-4xl text-muted-foreground/30'>
                  {item.type === 'product' && '📦'}
                  {item.type === 'bundle' && '🎁'}
                  {item.type === 'service' && '🔧'}
                  {item.type === 'event' && '🎪'}
                </div>
              </div>
            )}

            {/* Botones de quick add/remove en hover - ocupan mitades de la imagen */}
            {!(isOutOfStock || hasNoStock || isLoading) && (
              <>
                {/* Botón de remover (mitad izquierda) */}
                <div className='absolute left-0 top-0 w-1/2 h-full opacity-0 group-hover/image:opacity-100 md:group-hover/image:opacity-100 transition-opacity duration-200 z-[5]'>
                  <button
                    onClick={handleQuickRemove}
                    onTouchStart={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onTouchEnd={(e) => {
                      setTimeout(() => {
                        e.currentTarget.style.opacity = ''
                      }, 150)
                    }}
                    className='w-full h-full bg-gray-800/70 hover:bg-gray-700/80 active:bg-gray-600/90 text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm touch-manipulation'
                    title='Quitar uno'
                    type='button'
                  >
                    <Minus className='h-6 w-6 sm:h-8 sm:w-8' />
                  </button>
                </div>

                {/* Botón de agregar (mitad derecha) */}
                <div className='absolute right-0 top-0 w-1/2 h-full opacity-0 group-hover/image:opacity-100 md:group-hover/image:opacity-100 transition-opacity duration-200 z-[5]'>
                  <button
                    onClick={handleQuickAdd}
                    onTouchStart={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onTouchEnd={(e) => {
                      setTimeout(() => {
                        e.currentTarget.style.opacity = ''
                      }, 150)
                    }}
                    className='w-full h-full bg-gray-800/70 hover:bg-gray-700/80 active:bg-gray-600/90 text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm touch-manipulation'
                    title='Agregar uno'
                    type='button'
                  >
                    <Plus className='h-6 w-6 sm:h-8 sm:w-8' />
                  </button>
                </div>
              </>
            )}

            {/* Superposición para productos sin stock */}
            {(isOutOfStock || hasNoStock) && !isLoading && (
              <div className='absolute inset-0 bg-red-500/20 flex items-center justify-center'>
                <div className='bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1'>
                  <AlertTriangle className='h-3 w-3' />
                  Sin Stock
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className='absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-sm'>
                <div className='bg-primary text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2'>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Agregando...
                </div>
              </div>
            )}

            {/* Badge de tipo */}
            <div className='absolute top-1 left-1 sm:top-2 sm:left-2'>
              <Badge
                variant='secondary'
                className={`${getTypeColor(item.type)} text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1`}
              >
                <span className='block sm:hidden'>
                  {item.type === 'product' && 'P'}
                  {item.type === 'service' && 'S'}
                  {item.type === 'event' && 'E'}
                  {item.type === 'bundle' && 'PQ'}
                </span>
                <span className='hidden sm:block'>
                  {item.type === 'product' && 'Producto'}
                  {item.type === 'service' && 'Servicio'}
                  {item.type === 'event' && 'Evento'}
                  {item.type === 'bundle' && 'Paquete'}
                </span>
              </Badge>
            </div>

            <div className='absolute top-1 right-1 sm:top-2 sm:right-2 z-[5]'>
              <button
                onClick={handleShowDetails}
                className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 shadow-lg border-2 border-gray-200 transition-all duration-200 flex items-center justify-center'
                title={`Ver detalles del ${item.type.slice(0, -1).toLowerCase()}`}
                type='button'
              >
                <Info className='h-3 w-3 sm:h-4 sm:w-4' />
              </button>
            </div>
          </div>

          {/* Información del producto */}
          <div className='p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2'>
            <h3 className='font-semibold text-xs sm:text-sm line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight'>
              {item.itemDetails.name}
            </h3>

            <div className='flex items-center justify-between gap-2'>
              <span
                className={`text-sm sm:text-base md:text-lg font-bold truncate ${
                  isOutOfStock || hasNoStock
                    ? 'text-muted-foreground line-through'
                    : 'text-primary'
                }`}
              >
                {formatPrice(item.itemDetails.price)}
              </span>
            </div>

            {/* Control de cantidad - solo se muestra si no hay problemas de stock y no está cargando */}
            {!(isOutOfStock || hasNoStock || isLoading) && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    Cantidad:
                  </span>
                  <div className='flex items-center gap-1'>
                    <Button
                      onClick={decrementQuantity}
                      size='sm'
                      variant='outline'
                      className='h-6 w-6 p-0'
                      disabled={quantity <= 1}
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                    <Input
                      type='number'
                      value={quantity === 0 ? '' : quantity}
                      onChange={handleQuantityChange}
                      placeholder='1'
                      className='h-6 w-12 text-center text-xs p-1'
                      min='1'
                      max={
                        'stock' in item.itemDetails
                          ? item.itemDetails.stock
                          : Infinity
                      }
                    />
                    <Button
                      onClick={incrementQuantity}
                      size='sm'
                      variant='outline'
                      className='h-6 w-6 p-0'
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                  </div>
                </div>

                {/* Botón de agregar con cantidad */}
                <Button
                  onClick={handleAddToCart}
                  size='sm'
                  className='w-full h-8 text-xs'
                  disabled={isDisabled}
                >
                  {isLoading ? (
                    <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Plus className='h-3 w-3 mr-1' />
                  )}
                  {isLoading ? 'Agregando...' : `Agregar ${(quantity > 1 && quantity !== 0) ? `(${quantity})` : ''}`}
                </Button>
              </div>
            )}

            {/* Mensaje para productos deshabilitados */}
            {(isOutOfStock || hasNoStock) && (
              <div className='text-center py-2'>
                <span className='text-xs text-muted-foreground'>
                  No disponible
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles del paquete */}
      {item.type === 'bundle' && (
        <BundleDetailsDialog
          bundle={item.itemDetails as Bundle}
          isOpen={showBundleDetails}
          onClose={() => setShowBundleDetails(false)}
        />
      )}

      {/* Diálogo de detalles de productos, servicios y eventos */}
      <ItemDetailsDialog
        item={item}
        isOpen={showItemDetails}
        onClose={() => setShowItemDetails(false)}
      />
    </>
  )
}

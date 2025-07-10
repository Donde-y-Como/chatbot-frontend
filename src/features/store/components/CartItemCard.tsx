import React, { useEffect, useState } from 'react'
import { Check, Edit3, Minus, Plus, Trash2, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  CartItemRequest,
  CartItemType,
  CartItemWithDetails,
  Price,
  UpdateCartItemPriceRequest,
} from '@/features/store/types.ts'

interface CartItemCardProps {
  item: CartItemWithDetails
  onRemove: (itemId: string) => void
  onUpdateQuantity: (item: CartItemRequest) => void
  onUpdatePrice: (item: UpdateCartItemPriceRequest) => void
}

export function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
}: CartItemCardProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false)

  const currentPrice = item.effectiveUnitPrice.amount

  const [tempPrice, setTempPrice] = useState(currentPrice.toString())

  useEffect(() => {
    setTempPrice(currentPrice.toString())
  }, [currentPrice])

  const handlePriceClick = () => {
    setIsEditingPrice(true)
    setTempPrice(currentPrice.toString())
  }

  const handlePriceSubmit = () => {
    const newAmount = parseFloat(tempPrice)

    if (newAmount <= 0) {
      toast.error('El precio debe ser mayor a 0')
      return
    }

    onUpdatePrice({
      itemId: item.itemId,
      newPrice: {
        amount: newAmount,
        currency: item.effectiveUnitPrice.currency,
      },
      itemType: item.itemType,
    })

    setIsEditingPrice(false)
  }

  const handlePriceCancel = () => {
    setTempPrice(currentPrice.toString())
    setIsEditingPrice(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceSubmit()
    } else if (e.key === 'Escape') {
      handlePriceCancel()
    }
  }

  const formatPrice = (price: Price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }

  const getTypeColor = (type: CartItemType) => {
    switch (type) {
      case 'product':
        return 'bg-blue-500'
      case 'service':
        return 'bg-green-500'
      case 'event':
        return 'bg-purple-500'
      case 'bundle':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: CartItemType) => {
    switch (type) {
      case 'product':
        return '📦'
      case 'service':
        return '🔧'
      case 'event':
        return '🎪'
      case 'bundle':
        return '📋'
      default:
        return '❓'
    }
  }

  const totalItemPrice = currentPrice * item.quantity

  return (
    <div className='flex gap-2 sm:gap-3 p-2 sm:p-3 border border-border rounded-lg bg-card'>
      {/* Imagen miniatura */}
      <div className='relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted'>
        {item.itemDetails?.photos ? (
          <img
            src={item.itemDetails.photos[0]}
            alt={item.itemName}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80'>
            <div className='text-lg sm:text-xl text-muted-foreground/50'>
              {getTypeIcon(item.itemType)}
            </div>
          </div>
        )}

        {/* Badge de tipo */}
        <div className='absolute -top-1 -right-1'>
          <Badge
            variant='secondary'
            className={`${getTypeColor(item.itemType)} text-white text-xs px-1 py-0.5 scale-75`}
            title={item.itemType}
          >
            {item.itemType === 'product' && 'PRO'}
            {item.itemType === 'service' && 'SER'}
            {item.itemType === 'event' && 'EVE'}
            {item.itemType === 'bundle' && 'PAQ'}
          </Badge>
        </div>
      </div>

      {/* Información del item */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-1 sm:gap-2'>
          <h4 className='font-medium text-xs sm:text-sm lg:text-sm line-clamp-2 leading-tight flex-1 min-w-0'>
            {item.itemName === 'Cargando...' ? (
              <span className='text-muted-foreground animate-pulse'>
                Cargando nombre...
              </span>
            ) : (
              item.itemName
            )}
          </h4>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onRemove(item.itemId)}
            className='h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0'
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>

        <div className='mt-1 sm:mt-2 space-y-1 sm:space-y-2'>
          {/* Precio unitario editable */}
          <div className='flex items-center gap-1'>
            {isEditingPrice ? (
              <div className='flex items-center gap-1 flex-1 min-w-0'>
                <Input
                  type='number'
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className='h-6 text-xs flex-1 min-w-[60px] border-primary'
                  step='0.01'
                  min='0'
                  autoFocus
                />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handlePriceSubmit}
                  className='h-6 w-6 p-0 text-green-600 hover:text-green-700 flex-shrink-0'
                >
                  <Check className='h-3 w-3' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handlePriceCancel}
                  className='h-6 w-6 p-0 text-red-600 hover:text-red-700 flex-shrink-0'
                >
                  <XIcon className='h-3 w-3' />
                </Button>
              </div>
            ) : (
              <div className='flex items-center gap-1 flex-1 min-w-0'>
                <div className='flex flex-col flex-1 min-w-0'>
                  {/* Mostrar precio original tachado si existe modifiedPrice */}
                  {item.modifiedPrice && item.unitPrice && (
                    <span className='text-xs text-muted-foreground line-through truncate'>
                      {formatPrice(item.unitPrice)} c/u
                    </span>
                  )}
                  {/* Precio actual (modificado o unitario) */}
                  <span className='text-xs text-muted-foreground truncate'>
                    {formatPrice(item.effectiveUnitPrice)} c/u
                    {item.modifiedPrice && (
                      <span
                        className='ml-1 text-orange-600 font-medium'
                        title='Precio modificado'
                      >
                        (✓ editado)
                      </span>
                    )}
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handlePriceClick}
                  className='h-5 w-5 p-0 text-muted-foreground hover:text-primary flex-shrink-0'
                  title='Editar precio'
                >
                  <Edit3 className='h-3 w-3' />
                </Button>
              </div>
            )}
          </div>

          {/* Controles de cantidad y precio total */}
          <div className='flex items-center justify-between gap-2'>
            {/* Controles de cantidad */}
            <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  onUpdateQuantity({
                    itemId: item.itemId,
                    quantity: item.quantity - 1,
                    itemType: item.itemType,
                    notes: item.notes,
                    eventDate: item.eventMetadata?.selectedDate,
                  })
                }
                className='h-6 w-6 sm:h-7 sm:w-7 p-0'
                disabled={item.quantity <= 1}
              >
                <Minus className='h-3 w-3' />
              </Button>

              <span className='text-xs sm:text-sm font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center'>
                {item.quantity}
              </span>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  onUpdateQuantity({
                    itemId: item.itemId,
                    quantity: item.quantity + 1,
                    itemType: item.itemType,
                    notes: item.notes,
                    eventDate: item.eventMetadata?.selectedDate,
                  })
                }}
                className='h-6 w-6 sm:h-7 sm:w-7 p-0'
              >
                <Plus className='h-3 w-3' />
              </Button>
            </div>

            {/* Precio total del item */}
            <span className='font-semibold text-xs sm:text-sm flex-shrink-0'>
              {formatPrice({
                amount: totalItemPrice,
                currency: item.effectiveUnitPrice.currency,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

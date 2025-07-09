import React from 'react'
import { ItemCard } from '@/features/store/components/ItemCard.tsx'
import { CartItemRequest, POSItem } from '../types'

interface ItemGridProps {
  items: POSItem[]
  onAddToCart: (item: CartItemRequest) => void
  onRemoveFromCart: (itemId: string) => void
}

export function ItemGrid({
  items,
  onAddToCart,
  onRemoveFromCart,
}: ItemGridProps) {
  return (
    <div className='p-2 sm:p-3 md:p-4'>
      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 sm:py-16 text-center'>
          <div className='text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 text-muted-foreground/30'>
            🔍
          </div>
          <h3 className='text-lg sm:text-xl font-semibold text-muted-foreground mb-2'>
            No se encontraron elementos
          </h3>
          <p className='text-sm sm:text-base text-muted-foreground'>
            Intenta cambiar los filtros o la búsqueda
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4'>
          {items.map((item) => (
            <ItemCard
              key={item.itemDetails.id}
              item={item}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}

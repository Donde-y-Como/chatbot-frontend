import React from 'react'
import { ItemGrid } from './ItemGrid'
import { CartItemRequest, POSItem } from '@/features/store/types.ts'

interface StoreItemsProps {
  items: POSItem[]
  onAddToCart: (item: CartItemRequest) => void
  onRemoveFromCart: (itemId: string) => void
}

export function StoreItems({
  items,
  onAddToCart,
  onRemoveFromCart,
}: StoreItemsProps) {
  return (
    <div className='flex-1 pb-20 lg:pb-4 lg:overflow-auto'>
      <ItemGrid
        items={items}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
      />
    </div>
  )
}
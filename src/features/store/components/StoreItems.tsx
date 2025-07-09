import React from 'react'
import { ItemGrid } from './ItemGrid'
import { POSItem } from '../types'

interface StoreItemsProps {
  items: any[]
  onAddToCart: (item: any) => void
  onRemoveFromCart: (itemId: string) => void
}

export function StoreItems({
  items,
  onAddToCart,
  onRemoveFromCart
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
import React from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { POSItem } from '../types'

interface ItemGridProps {
  items: POSItem[]
  onAddToCart: (item: Omit<POSItem, 'quantity'>) => void
}

interface ItemCardProps {
  item: POSItem
  onAddToCart: (item: Omit<POSItem, 'quantity'>) => void
}

function ItemCard({ item, onAddToCart }: ItemCardProps) {
  const handleAddToCart = () => {
    const { quantity, ...itemWithoutQuantity } = item
    onAddToCart(itemWithoutQuantity)
  }

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

  return (
    <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-0">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
              <div className="text-4xl text-muted-foreground/30">
                {item.type === 'PRODUCTOS' && '📦'}
                {item.type === 'SERVICIOS' && '🔧'}
                {item.type === 'EVENTOS' && '🎪'}
              </div>
            </div>
          )}
          
          {/* Badge de tipo */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              className={`${getTypeColor(item.type)} text-white text-xs px-2 py-1`}
            >
              {item.type.substring(0, item.type.length - 1)}
            </Badge>
          </div>

          {/* Botón de agregar - visible en hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Información del producto */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] leading-tight">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </span>
            
            {/* Botón de agregar para dispositivos táctiles */}
            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="outline"
              className="md:hidden p-2 h-8 w-8"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ItemGrid({ items, onAddToCart }: ItemGridProps) {
  return (
    <div className="p-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4 text-muted-foreground/30">🔍</div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No se encontraron elementos
          </h3>
          <p className="text-muted-foreground">
            Intenta cambiar los filtros o la búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
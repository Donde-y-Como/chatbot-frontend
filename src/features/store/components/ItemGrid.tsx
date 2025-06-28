import React, { useState } from 'react'
import { Plus, ShoppingCart, Info } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { POSItem, Bundle } from '../types'
import { BundleDetailsDialog } from './BundleDetailsDialog'

interface ItemGridProps {
  items: POSItem[]
  onAddToCart: (item: Omit<POSItem, 'quantity'>) => void
}

interface ItemCardProps {
  item: POSItem
  onAddToCart: (item: Omit<POSItem, 'quantity'>) => void
}

function ItemCard({ item, onAddToCart }: ItemCardProps) {
  const [showBundleDetails, setShowBundleDetails] = useState(false)

  const handleAddToCart = () => {
    const { quantity, ...itemWithoutQuantity } = item
    onAddToCart(itemWithoutQuantity)
  }

  const handleShowDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (item.type === 'PAQUETES' && item.originalData) {
      setShowBundleDetails(true)
    }
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
      case 'PAQUETES':
        return 'bg-orange-500'
      case 'SERVICIOS':
        return 'bg-green-500'
      case 'EVENTOS':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
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
                <div className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground/30">
                  {item.type === 'PRODUCTOS' && '📦'}
                  {item.type === 'PAQUETES' && '🎁'}
                  {item.type === 'SERVICIOS' && '🔧'}
                  {item.type === 'EVENTOS' && '🎪'}
                </div>
              </div>
            )}

            {/* Badge de tipo */}
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
              <Badge
                variant="secondary"
                className={`${getTypeColor(item.type)} text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1`}
              >
                <span className="block sm:hidden">
                  {item.type === 'PRODUCTOS' && 'P'}
                  {item.type === 'SERVICIOS' && 'S'}
                  {item.type === 'EVENTOS' && 'E'}
                  {item.type === 'PAQUETES' && 'PQ'}
                </span>
                <span className="hidden sm:block">
                  {item.type.substring(0, item.type.length - 1)}
                </span>
              </Badge>
            </div>

            {/* Botón de información para paquetes */}
            {item.type === 'PAQUETES' && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20">
                <button
                  onClick={handleShowDetails}
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 shadow-lg border-2 border-gray-200 transition-all duration-200 flex items-center justify-center"
                  title="Ver detalles del paquete"
                  type="button"
                >
                  <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            )}

            {/* Botón de agregar - visible en hover en desktop */}
            <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-0">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-200 hidden md:flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Información del producto */}
          <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight">
              {item.name}
            </h3>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base md:text-lg font-bold text-primary truncate">
                {formatPrice(item.price)}
              </span>

              {/* Botón de agregar siempre visible en móvil */}
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="md:hidden flex-shrink-0 h-7 w-7 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>

              {/* Botón de agregar visible en tablet */}
              <Button
                onClick={handleAddToCart}
                size="sm"
                variant="outline"
                className="hidden md:flex lg:hidden flex-shrink-0 h-8 w-8 p-0"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles del paquete */}
      {item.type === 'PAQUETES' && item.originalData && (
        <BundleDetailsDialog
          bundle={item.originalData as Bundle}
          isOpen={showBundleDetails}
          onClose={() => setShowBundleDetails(false)}
        />
      )}
    </>
  )
}

export function ItemGrid({ items, onAddToCart }: ItemGridProps) {
  return (
    <div className="p-2 sm:p-3 md:p-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 text-muted-foreground/30">🔍</div>
          <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
            No se encontraron elementos
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Intenta cambiar los filtros o la búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
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
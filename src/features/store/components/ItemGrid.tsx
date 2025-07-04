import React, { useState } from 'react'
import { Info, Plus, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Bundle, POSItem } from '../types'
import { BundleDetailsDialog } from './BundleDetailsDialog'
import { Product } from '../../products/types'
import { Service } from '../../services/types'
import { EventPrimitives } from '../../events/types'

interface ItemGridProps {
  items: POSItem[]
  onAddToCart: (item: Omit<POSItem, 'quantity'>) => void
}

interface ItemCardProps {
  item: POSItem
  onAddToCart: (item: Omit<POSItem, 'quantity'>) => void
}

function ItemDetailsDialog({ 
  item, 
  isOpen, 
  onClose 
}: { 
  item: POSItem | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!item || !item.originalData) return null

  const formatPrice = (price: { amount: number; currency: string }) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency
    }).format(price.amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderProductDetails = (product: Product) => (
    <div className="space-y-4">
      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">SKU</label>
          <p className="text-sm">{product.sku}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Estado</label>
          <Badge variant={product.status === 'ACTIVO' ? 'default' : 
                          product.status === 'SIN_STOCK' ? 'destructive' : 'secondary'}>
            {product.status === 'SIN_STOCK' ? 'Sin Stock' : product.status}
          </Badge>
        </div>
      </div>

      {/* Código de barras */}
      {product.barcode && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Código de Barras</label>
          <p className="text-sm">{product.barcode}</p>
        </div>
      )}

      {/* Descripción */}
      {product.description && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Descripción</label>
          <p className="text-sm mt-1">{product.description}</p>
        </div>
      )}

      <Separator />

      {/* Inventario y precios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Stock</label>
          <p className="text-sm">{product.stock} unidades</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Stock Mínimo</label>
          <p className="text-sm">{product.minimumInventory} unidades</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Precio</label>
          <p className="text-lg font-semibold text-primary">{formatPrice(product.finalPrice || product.price)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Costo</label>
          <p className="text-lg font-semibold">{formatPrice(product.cost)}</p>
        </div>
      </div>

      {product.discount > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Descuento</label>
          <p className="text-sm">{product.discount}%</p>
        </div>
      )}

      {product.notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Notas</label>
          <p className="text-sm mt-1">{product.notes}</p>
        </div>
      )}
    </div>
  )

  const renderServiceDetails = (service: Service) => (
    <div className="space-y-4">
      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">SKU</label>
          <p className="text-sm">{service.productInfo?.sku || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Estado</label>
          <Badge variant={service.productInfo?.status === 'active' ? 'default' : 'secondary'}>
            {service.productInfo?.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Código de barras */}
      {service.codigoBarras && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Código de Barras</label>
          <p className="text-sm">{service.codigoBarras}</p>
        </div>
      )}

      {/* Descripción */}
      {service.description && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Descripción</label>
          <p className="text-sm mt-1">{service.description}</p>
        </div>
      )}

      <Separator />

      {/* Duración y precios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Duración</label>
          <p className="text-sm">{service.duration.value} {service.duration.unit === 'minutes' ? 'minutos' : 'horas'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Capacidad Máxima</label>
          <p className="text-sm">{service.maxConcurrentBooks} citas simultáneas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Precio</label>
          <p className="text-lg font-semibold text-primary">{formatPrice(service.productInfo?.precioModificado || service.price)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Costo</label>
          <p className="text-lg font-semibold">{service.productInfo?.cost ? formatPrice(service.productInfo.cost) : 'N/A'}</p>
        </div>
      </div>

      {service.productInfo?.notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Notas</label>
          <p className="text-sm mt-1">{service.productInfo.notes}</p>
        </div>
      )}
    </div>
  )

  const renderEventDetails = (event: EventPrimitives) => (
    <div className="space-y-4">
      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">SKU</label>
          <p className="text-sm">{event.productInfo?.sku || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Estado</label>
          <Badge variant={event.productInfo?.status === 'active' ? 'default' : 'secondary'}>
            {event.productInfo?.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Descripción */}
      {event.description && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Descripción</label>
          <p className="text-sm mt-1">{event.description}</p>
        </div>
      )}

      <Separator />

      {/* Fechas y capacidad */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Inicio</label>
          <p className="text-sm">{formatDate(event.duration.startAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Fin</label>
          <p className="text-sm">{formatDate(event.duration.endAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Capacidad</label>
          <p className="text-sm">
            {event.capacity.isLimited 
              ? `${event.capacity.maxCapacity} personas máximo`
              : 'Ilimitada'
            }
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
          <p className="text-sm">{event.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Precio</label>
          <p className="text-lg font-semibold text-primary">{formatPrice(event.productInfo?.precioModificado || event.price)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Costo</label>
          <p className="text-lg font-semibold">{event.productInfo?.cost ? formatPrice(event.productInfo.cost) : 'N/A'}</p>
        </div>
      </div>

      {event.productInfo?.notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Notas</label>
          <p className="text-sm mt-1">{event.productInfo.notes}</p>
        </div>
      )}
    </div>
  )

  const getDialogTitle = () => {
    const icons = {
      PRODUCTOS: '📦',
      SERVICIOS: '🔧', 
      EVENTOS: '🎪',
      PAQUETES: '🎁'
    }
    
    return (
      <DialogTitle className="flex items-center gap-2">
        <span>{icons[item.type]}</span>
        Detalles del {item.type.slice(0, -1)}: {item.name}
      </DialogTitle>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          {getDialogTitle()}
        </DialogHeader>
        
        <div className="space-y-6">
          {item.type === 'PRODUCTOS' && renderProductDetails(item.originalData as Product)}
          {item.type === 'SERVICIOS' && renderServiceDetails(item.originalData as Service)}
          {item.type === 'EVENTOS' && renderEventDetails(item.originalData as EventPrimitives)}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ItemCard({ item, onAddToCart }: ItemCardProps) {
  const [showBundleDetails, setShowBundleDetails] = useState(false)
  const [showItemDetails, setShowItemDetails] = useState(false)

  // Verificar si el producto está sin stock
  const isOutOfStock = item.type === 'PRODUCTOS' && 
    item.originalData && 
    'status' in item.originalData && 
    item.originalData.status === 'SIN_STOCK'

  // Verificar si el producto tiene stock 0
  const hasNoStock = item.type === 'PRODUCTOS' && 
    item.originalData && 
    'stock' in item.originalData && 
    item.originalData.stock === 0

  const isDisabled = !!(isOutOfStock || hasNoStock)

  const handleAddToCart = () => {
    if (isDisabled) return
    const { quantity, ...itemWithoutQuantity } = item
    onAddToCart(itemWithoutQuantity)
  }

  const handleShowDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (item.type === 'PAQUETES' && item.originalData) {
      setShowBundleDetails(true)
    } else if (['PRODUCTOS', 'SERVICIOS', 'EVENTOS'].includes(item.type) && item.originalData) {
      setShowItemDetails(true)
    }
  }

  const formatPrice = (price: typeof item.price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
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
      <Card className={`group relative overflow-hidden border-2 transition-all duration-200 ${
        isDisabled 
          ? 'border-red-200 bg-gray-50 opacity-60' 
          : 'border-transparent hover:border-primary/20 hover:shadow-lg'
      }`}>
        <CardContent className='p-0'>
          {/* Imagen del producto */}
          <div className='relative aspect-square overflow-hidden bg-muted'>
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isDisabled ? 'grayscale' : 'group-hover:scale-105'
                }`}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80'>
                <div className='text-2xl sm:text-3xl md:text-4xl text-muted-foreground/30'>
                  {item.type === 'PRODUCTOS' && '📦'}
                  {item.type === 'PAQUETES' && '🎁'}
                  {item.type === 'SERVICIOS' && '🔧'}
                  {item.type === 'EVENTOS' && '🎪'}
                </div>
              </div>
            )}

            {/* Superposición para productos sin stock */}
            {isDisabled && (
              <div className='absolute inset-0 bg-red-500/20 flex items-center justify-center'>
                <div className='bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1'>
                  <AlertTriangle className='h-3 w-3' />
                  Sin Stock
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
                  {item.type === 'PRODUCTOS' && 'P'}
                  {item.type === 'SERVICIOS' && 'S'}
                  {item.type === 'EVENTOS' && 'E'}
                  {item.type === 'PAQUETES' && 'PQ'}
                </span>
                <span className='hidden sm:block'>
                  {item.type.substring(0, item.type.length - 1)}
                </span>
              </Badge>
            </div>

            {/* Botón de información para paquetes, productos, servicios y eventos */}
            {(['PAQUETES', 'PRODUCTOS', 'SERVICIOS', 'EVENTOS'].includes(item.type)) && (
              <div className='absolute top-1 right-1 sm:top-2 sm:right-2 z-20'>
                <button
                  onClick={handleShowDetails}
                  className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 shadow-lg border-2 border-gray-200 transition-all duration-200 flex items-center justify-center'
                  title={`Ver detalles del ${item.type.slice(0, -1).toLowerCase()}`}
                  type='button'
                >
                  <Info className='h-3 w-3 sm:h-4 sm:w-4' />
                </button>
              </div>
            )}

            {/* Botón de agregar - visible en hover en desktop */}
            {!isDisabled && (
              <div className='absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-0'>
                <Button
                  onClick={handleAddToCart}
                  size='lg'
                  className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-200 hidden md:flex'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Agregar
                </Button>
              </div>
            )}
          </div>

          {/* Información del producto */}

          <div className='p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2'>
            <h3 className='font-semibold text-xs sm:text-sm line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight'>
              {item.name}
            </h3>

            <div className='flex items-center justify-between gap-2'>
              <span className={`text-sm sm:text-base md:text-lg font-bold truncate ${
                isDisabled ? 'text-muted-foreground line-through' : 'text-primary'
              }`}>
                {formatPrice(item.price)}
              </span>

              {/* Botón de agregar siempre visible en móvil */}
              <Button
                onClick={handleAddToCart}
                size='sm'
                disabled={isDisabled}
                className='md:hidden flex-shrink-0 h-7 w-7 p-0'
              >
                <Plus className='h-3 w-3' />
              </Button>

              {/* Botón de agregar visible en tablet */}
              <Button
                onClick={handleAddToCart}
                size='sm'
                variant='outline'
                disabled={isDisabled}
                className='hidden md:flex lg:hidden flex-shrink-0 h-8 w-8 p-0'
              >
                <ShoppingCart className='h-4 w-4' />
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
      
      {/* Diálogo de detalles de productos, servicios y eventos */}
      <ItemDetailsDialog
        item={item}
        isOpen={showItemDetails}
        onClose={() => setShowItemDetails(false)}
      />
    </>
  )
}

export function ItemGrid({ items, onAddToCart }: ItemGridProps) {
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
            <ItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}

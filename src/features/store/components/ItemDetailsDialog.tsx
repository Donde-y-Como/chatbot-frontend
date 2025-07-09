import React from 'react'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { POSItem } from '@/features/store/types.ts'
import { EventPrimitives } from '../../events/types'
import { Product, ProductStatus } from '../../products/types'
import { Service } from '../../services/types'

export function ItemDetailsDialog({
  item,
  isOpen,
  onClose,
}: {
  item: POSItem | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!item) return null

  const formatPrice = (price: { amount: number; currency: string }) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderProductDetails = (product: Product) => (
    <div className='space-y-4'>
      {/* Información básica */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            SKU
          </label>
          <p className='text-sm'>{product.sku}</p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Estado
          </label>
          <Badge
            variant={
              product.status === 'ACTIVO'
                ? 'default'
                : product.status === 'SIN_STOCK'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {product.status === 'SIN_STOCK' ? 'Sin Stock' : product.status}
          </Badge>
        </div>
      </div>

      {/* Código de barras */}
      {product.barcode && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Código de Barras
          </label>
          <p className='text-sm'>{product.barcode}</p>
        </div>
      )}

      {/* Descripción */}
      {product.description && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Descripción
          </label>
          <p className='text-sm mt-1'>{product.description}</p>
        </div>
      )}

      <Separator />

      {/* Inventario y precios */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Stock
          </label>
          <p className='text-sm'>{product.stock} unidades</p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Stock Mínimo
          </label>
          <p className='text-sm'>{product.minimumInventory} unidades</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Precio
          </label>
          <p className='text-lg font-semibold text-primary'>
            {formatPrice(product.finalPrice || product.price)}
          </p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Costo
          </label>
          <p className='text-lg font-semibold'>{formatPrice(product.cost)}</p>
        </div>
      </div>

      {product.discount > 0 && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Descuento
          </label>
          <p className='text-sm'>{product.discount}%</p>
        </div>
      )}

      {product.notes && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Notas
          </label>
          <p className='text-sm mt-1'>{product.notes}</p>
        </div>
      )}
    </div>
  )

  const renderServiceDetails = (service: Service) => (
    <div className='space-y-4'>
      {/* Información básica */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            SKU
          </label>
          <p className='text-sm'>{service.productInfo?.sku || 'N/A'}</p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Estado
          </label>
          <Badge
            variant={
              service.productInfo.status === ProductStatus.ACTIVO
                ? 'default'
                : 'secondary'
            }
          >
            {service.productInfo.status === ProductStatus.ACTIVO
              ? 'Activo'
              : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Código de barras */}
      {service.codigoBarras && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Código de Barras
          </label>
          <p className='text-sm'>{service.codigoBarras}</p>
        </div>
      )}

      {/* Descripción */}
      {service.description && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Descripción
          </label>
          <p className='text-sm mt-1'>{service.description}</p>
        </div>
      )}

      <Separator />

      {/* Duración y precios */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Duración
          </label>
          <p className='text-sm'>
            {service.duration.value}{' '}
            {service.duration.unit === 'minutes' ? 'minutos' : 'horas'}
          </p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Capacidad Máxima
          </label>
          <p className='text-sm'>
            {service.maxConcurrentBooks} citas simultáneas
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Precio
          </label>
          <p className='text-lg font-semibold text-primary'>
            {formatPrice(service.productInfo.precioModificado || service.price)}
          </p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Costo
          </label>
          <p className='text-lg font-semibold'>
            {service.productInfo.cost
              ? formatPrice(service.productInfo.cost)
              : 'N/A'}
          </p>
        </div>
      </div>

      {service.productInfo.notes && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Notas
          </label>
          <p className='text-sm mt-1'>{service.productInfo.notes}</p>
        </div>
      )}
    </div>
  )

  const renderEventDetails = (event: EventPrimitives) => (
    <div className='space-y-4'>
      {/* Información básica */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            SKU
          </label>
          <p className='text-sm'>{event.productInfo?.sku || 'N/A'}</p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Estado
          </label>
          <Badge
            variant={
              event.productInfo.status === ProductStatus.ACTIVO
                ? 'default'
                : 'secondary'
            }
          >
            {event.productInfo.status === ProductStatus.ACTIVO
              ? 'Activo'
              : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Descripción */}
      {event.description && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Descripción
          </label>
          <p className='text-sm mt-1'>{event.description}</p>
        </div>
      )}

      <Separator />

      {/* Fechas y capacidad */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Inicio
          </label>
          <p className='text-sm'>{formatDate(event.duration.startAt)}</p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Fin
          </label>
          <p className='text-sm'>{formatDate(event.duration.endAt)}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Capacidad
          </label>
          <p className='text-sm'>
            {event.capacity.isLimited
              ? `${event.capacity.maxCapacity} personas máximo`
              : 'Ilimitada'}
          </p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Ubicación
          </label>
          <p className='text-sm'>{event.location}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Precio
          </label>
          <p className='text-lg font-semibold text-primary'>
            {formatPrice(event.productInfo.precioModificado || event.price)}
          </p>
        </div>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Costo
          </label>
          <p className='text-lg font-semibold'>
            {event.productInfo.cost
              ? formatPrice(event.productInfo.cost)
              : 'N/A'}
          </p>
        </div>
      </div>

      {event.productInfo.notes && (
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Notas
          </label>
          <p className='text-sm mt-1'>{event.productInfo.notes}</p>
        </div>
      )}
    </div>
  )

  const getDialogTitle = () => {
    const icons = {
      product: '📦',
      service: '🔧',
      event: '🎪',
      bundle: '🎁',
    }

    return (
      <DialogTitle className='flex items-center gap-2'>
        <span>{icons[item.type]}</span>
        Detalles del {item.type.slice(0, -1)}: {item.itemDetails.name}
      </DialogTitle>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>{getDialogTitle()}</DialogHeader>

        <div className='space-y-6'>
          {item.type === 'product' &&
            renderProductDetails(item.itemDetails as Product)}
          {item.type === 'service' &&
            renderServiceDetails(item.itemDetails as Service)}
          {item.type === 'event' &&
            renderEventDetails(item.itemDetails as EventPrimitives)}
        </div>
      </DialogContent>
    </Dialog>
  )
}

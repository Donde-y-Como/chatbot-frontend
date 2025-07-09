import React, { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Bundle } from '@/features/bundles/types'

interface BundleDetailsDialogProps {
  bundle: Bundle | null
  isOpen: boolean
  onClose: () => void
}

export function BundleDetailsDialog({
  bundle,
  isOpen,
  onClose,
}: BundleDetailsDialogProps) {
  const [bundleDetails, setBundleDetails] = useState<{
    items: Array<{ product: any; quantity: number }>
    tags: Array<{ id: string; name: string; color?: string }>
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bundle && isOpen) {
      setLoading(true)
      Promise.all([
        // Obtener detalles de los productos en el bundle
        Promise.all(
          bundle.items.map(async (item) => {
            return { product: null, quantity: item.quantity }
          })
        ),
        // Obtener detalles de las etiquetas
        Promise.all(
          bundle.tagIds.map(async (tagId) => {
            return { id: tagId, name: 'Etiqueta no encontrada' }
          })
        ),
      ]).then(([items, tags]) => {
        setBundleDetails({ items, tags })
        setLoading(false)
      })
    }
  }, [bundle, isOpen])

  if (!bundle) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Detalles del Paquete: {bundle.name}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Información básica */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                SKU
              </label>
              <p className='text-sm'>{bundle.sku}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Estado
              </label>
              <Badge
                variant={bundle.status === 'ACTIVO' ? 'default' : 'secondary'}
              >
                {bundle.status}
              </Badge>
            </div>
          </div>

          {/* Descripción */}
          {bundle.description && (
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Descripción
              </label>
              <p className='text-sm mt-1'>{bundle.description}</p>
            </div>
          )}

          <Separator />

          {/* Precios */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Precio
              </label>
              <p className='text-lg font-semibold text-primary'>
                {formatPrice(bundle.price)}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Costo
              </label>
              <p className='text-lg font-semibold'>
                {formatPrice(bundle.cost)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Etiquetas */}
          {bundleDetails?.tags && bundleDetails.tags.length > 0 && (
            <div>
              <label className='text-sm font-medium text-muted-foreground mb-2 block'>
                Etiquetas
              </label>
              <div className='flex flex-wrap gap-2'>
                {bundleDetails.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant='outline'
                    style={{
                      backgroundColor: tag.color,
                      color: tag.color ? '#fff' : undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Productos incluidos */}
          <div>
            <label className='text-sm font-medium text-muted-foreground mb-3 block'>
              Productos incluidos
            </label>
            {loading ? (
              <div className='text-center py-4'>
                <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto'></div>
                <p className='text-sm text-muted-foreground mt-2'>
                  Cargando productos...
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {bundleDetails?.items.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 p-3 border rounded-lg'
                  >
                    {item.product ? (
                      <>
                        <div className='flex-shrink-0'>
                          {item.product.photos?.[0] ? (
                            <img
                              src={item.product.photos[0]}
                              alt={item.product.name}
                              className='w-12 h-12 object-cover rounded'
                            />
                          ) : (
                            <div className='w-12 h-12 bg-muted rounded flex items-center justify-center'>
                              <Package className='h-6 w-6 text-muted-foreground' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium text-sm'>
                            {item.product.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Cantidad: {item.quantity}{' '}
                            {item.product.unit?.abbreviation || 'unidad(es)'}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium'>
                            {formatPrice(
                              item.product.finalPrice || item.product.price
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className='flex items-center gap-3 text-muted-foreground'>
                        <Package className='h-6 w-6' />
                        <span className='text-sm'>
                          Producto no encontrado (Cantidad: {item.quantity})
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

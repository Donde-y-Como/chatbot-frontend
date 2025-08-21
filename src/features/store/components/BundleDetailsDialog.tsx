import React, { useEffect, useState } from 'react'
import { Package, Calendar, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Bundle } from '@/features/bundles/types'
import { ProductApiService } from '@/features/products/ProductApiService'
import { appointmentService } from '@/features/appointments/appointmentService'
import { api } from '@/api/axiosInstance'
import { ProductPrimitives, Unit } from '@/features/products/types'
import { Service } from '@/features/appointments/types'
import { EventPrimitives } from '@/features/events/types'

interface BundleDetailsDialogProps {
  bundle: Bundle | null
  isOpen: boolean
  onClose: () => void
}

type ItemWithDetails = {
  id: string
  type: 'product' | 'service' | 'event'
  quantity: number
  details: ProductPrimitives | Service | EventPrimitives | null
  unit?: Unit | null // Para productos
}

export function BundleDetailsDialog({
  bundle,
  isOpen,
  onClose,
}: BundleDetailsDialogProps) {
  const [bundleDetails, setBundleDetails] = useState<{
    items: ItemWithDetails[]
    tags: Array<{ id: string; name: string; color?: string }>
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bundle && isOpen) {
      setLoading(true)
      
      const fetchItemDetails = async (item: any) => {
        try {
          let details: ProductPrimitives | Service | EventPrimitives | null = null
          let unit: Unit | null = null
          
          switch (item.type) {
            case 'product':
              details = await ProductApiService.getProductById(item.itemId)
              // Obtener la unidad del producto
              if (details && (details as ProductPrimitives).unitId) {
                try {
                  const units = await ProductApiService.getUnits()
                  unit = units.find(u => u.id === (details as ProductPrimitives).unitId) || null
                } catch (error) {
                  console.error('Error fetching unit:', error)
                }
              }
              break
            case 'service':
              // Obtener todos los servicios y encontrar el específico
              { const services = await appointmentService.getServices()
              details = services.find(service => service.id === item.itemId) || null
              break }
            case 'event':
              // Obtener el evento específico
              { const response = await api.get(`/events/${item.itemId}`)
              details = response.data
              break }
          }
          
          return {
            id: item.itemId,
            type: item.type,
            quantity: item.quantity,
            details,
            unit
          } as ItemWithDetails
        } catch (error) {
          console.error(`Error fetching ${item.type} details for ${item.itemId}:`, error)
          return {
            id: item.itemId,
            type: item.type,
            quantity: item.quantity,
            details: null,
            unit: null
          } as ItemWithDetails
        }
      }

      const fetchTagDetails = async (tagId: string) => {
        try {
          const productTags = await ProductApiService.getProductTags()
          const tag = productTags.find(t => t.id === tagId)
          return {
            id: tagId,
            name: tag?.name || 'Etiqueta no encontrada',
            color: tag?.color
          }
        } catch (error) {
          console.error(`Error fetching tag details for ${tagId}:`, error)
          return { id: tagId, name: 'Etiqueta no encontrada' }
        }
      }

      Promise.all([
        // Obtener detalles de los items en el bundle
        Promise.all(bundle.items.map(fetchItemDetails)),
        // Obtener detalles de las etiquetas
        Promise.all(bundle.tagIds.map(fetchTagDetails)),
      ]).then(([items, tags]) => {
        setBundleDetails({ items, tags })
        setLoading(false)
      }).catch(error => {
        console.error('Error fetching bundle details:', error)
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

          {/* Items incluidos */}
          <div>
            <label className='text-sm font-medium text-muted-foreground mb-3 block'>
              Items incluidos
            </label>
            {loading ? (
              <div className='text-center py-4'>
                <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto'></div>
                <p className='text-sm text-muted-foreground mt-2'>
                  Cargando items...
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {bundleDetails?.items.map((item, index) => {
                  const getItemIcon = () => {
                    switch (item.type) {
                      case 'product':
                        return <Package className='h-6 w-6 text-muted-foreground' />
                      case 'service':
                        return <Wrench className='h-6 w-6 text-muted-foreground' />
                      case 'event':
                        return <Calendar className='h-6 w-6 text-muted-foreground' />
                      default:
                        return <Package className='h-6 w-6 text-muted-foreground' />
                    }
                  }

                  const getItemTypeLabel = () => {
                    switch (item.type) {
                      case 'product':
                        return 'Producto'
                      case 'service':
                        return 'Servicio'
                      case 'event':
                        return 'Evento'
                      default:
                        return 'Item'
                    }
                  }

                  return (
                    <div
                      key={`${item.type}-${item.id}-${index}`}
                      className='flex items-center gap-3 p-3 border rounded-lg'
                    >
                      {item.details ? (
                        <>
                          <div className='flex-shrink-0'>
                            {/* Mostrar imagen según el tipo de item */}
                            {item.type === 'product' && (item.details as ProductPrimitives).photos?.[0] ? (
                              <img
                                src={(item.details as ProductPrimitives).photos[0]}
                                alt={(item.details as any).name}
                                className='w-12 h-12 object-cover rounded'
                              />
                            ) : item.type === 'event' && (item.details as EventPrimitives).photos?.[0] ? (
                              <img
                                src={(item.details as EventPrimitives).photos[0]}
                                alt={(item.details as any).name}
                                className='w-12 h-12 object-cover rounded'
                              />
                            ) : (
                              <div className='w-12 h-12 bg-muted rounded flex items-center justify-center'>
                                {getItemIcon()}
                              </div>
                            )}
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <p className='font-medium text-sm'>
                                {(item.details as any).name}
                              </p>
                              <Badge variant='secondary' className='text-xs'>
                                {getItemTypeLabel()}
                              </Badge>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              Cantidad: {item.quantity}{' '}
                              {item.type === 'product' 
                                ? (item.unit?.abbreviation || 'unidad(es)')
                                : item.type === 'service'
                                ? 'sesión(es)'
                                : 'entrada(s)'
                              }
                            </p>
                            {(item.details as any).description && (
                              <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                                {(item.details as any).description}
                              </p>
                            )}
                          </div>
                          <div className='text-right'>
                            {/* Mostrar precio según el tipo */}
                            {item.type === 'product' && (item.details as ProductPrimitives).price && (
                              <p className='text-sm font-medium'>
                                {formatPrice((item.details as ProductPrimitives).finalPrice || (item.details as ProductPrimitives).price)}
                              </p>
                            )}
                            {item.type === 'service' && (item.details as Service).price && (
                              <p className='text-sm font-medium'>
                                {formatPrice((item.details as Service).price)}
                              </p>
                            )}
                            {item.type === 'event' && (item.details as EventPrimitives).price && (
                              <p className='text-sm font-medium'>
                                {formatPrice((item.details as EventPrimitives).price)}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className='flex items-center gap-3 text-muted-foreground'>
                          {getItemIcon()}
                          <div className='flex-1'>
                            <span className='text-sm'>
                              {getItemTypeLabel()} no encontrado
                            </span>
                            <p className='text-xs'>
                              ID: {item.id} - Cantidad: {item.quantity}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

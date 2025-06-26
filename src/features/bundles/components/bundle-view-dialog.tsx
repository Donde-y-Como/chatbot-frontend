import {
  Calculator,
  Calendar,
  Eye,
  File,
  FileText,
  Image,
  Music,
  Package,
  Tag,
  Video,
  Wrench,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useGetServices } from '@/features/appointments/hooks/useGetServices'
import { BundleItemResponse } from '@/features/bundles/types.ts'
import { useGetProductTags } from '@/features/products/hooks/useGetAuxiliaryData'
import { useGetProducts } from '@/features/products/hooks/useGetProducts'
import { ProductTag } from '@/features/products/types.ts'
import { useBundleContext } from '../context/bundles-context'

// File type utilities
const getFileIcon = (type: string) => {
  switch (type) {
    case 'image':
      return <Image className='h-8 w-8 text-blue-500' />
    case 'video':
      return <Video className='h-8 w-8 text-purple-500' />
    case 'audio':
      return <Music className='h-8 w-8 text-green-500' />
    case 'document':
      return <FileText className='h-8 w-8 text-orange-500' />
    default:
      return <File className='h-8 w-8 text-gray-500' />
  }
}

export function BundleViewDialog() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedBundle,
    setDialogMode,
    setSelectedBundle,
  } = useBundleContext()

  const { data: products } = useGetProducts()
  const { data: services = [] } = useGetServices()
  const { data: tags = [] } = useGetProductTags()

  if (!products) {
    return <div>Loading...</div>
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setDialogMode(null)
    setSelectedBundle(null)
  }

  const handleEdit = () => {
    setDialogMode('edit')
  }

  if (!selectedBundle) return null

  const getItemDetails = (item: BundleItemResponse) => {
    if (item.type === 'product') {
      const product = products.products.find((p) => p.id === item.itemId)
      return {
        name: product?.name || 'Producto no encontrado',
        price: product?.price?.amount || 0,
        currency: product?.price?.currency || 'MXN',
        sku: product?.sku,
        stock: product?.stock,
      }
    } else {
      const service = services.find((s) => s.id === item.itemId)
      return {
        name: service?.name || 'Servicio no encontrado',
        price: service?.price?.amount || 0,
        currency: service?.price?.currency || 'MXN',
        duration: service?.duration,
      }
    }
  }

  const getBundleTags = (): ProductTag[] => {
    return selectedBundle.tagIds
      .map((tagId) => tags.find((tag) => tag.id === tagId))
      .filter((tag): tag is ProductTag => tag !== undefined)
  }

  const calculateTotalItemsCost = () => {
    return selectedBundle.items.reduce((total, item) => {
      const details = getItemDetails(item)
      return total + details.price * item.quantity
    }, 0)
  }

  const bundleTags = getBundleTags()
  const totalItemsCost = calculateTotalItemsCost()
  const profit = selectedBundle.price.amount - selectedBundle.cost.amount
  const profitMargin =
    selectedBundle.price.amount > 0
      ? ((profit / selectedBundle.price.amount) * 100).toFixed(1)
      : '0'

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            Ver Paquete: {selectedBundle.name}
          </DialogTitle>
          <DialogDescription>
            Detalles completos del paquete seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    SKU
                  </p>
                  <p className='text-lg font-mono'>{selectedBundle.sku}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Estado
                  </p>
                  <Badge
                    variant={
                      selectedBundle.status === 'ACTIVO'
                        ? 'default'
                        : 'secondary'
                    }
                    className='mt-1'
                  >
                    {selectedBundle.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Nombre
                </p>
                <p className='text-lg'>{selectedBundle.name}</p>
              </div>

              {selectedBundle.description && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Descripción
                  </p>
                  <p className='text-sm leading-relaxed'>
                    {selectedBundle.description}
                  </p>
                </div>
              )}

              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Fecha de creación
                </p>
                <p className='text-sm flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  {new Date(selectedBundle.createdAt).toLocaleDateString(
                    'es-ES',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Precios y Rentabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calculator className='h-5 w-5' />
                Precios y Rentabilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Precio de Venta
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {formatCurrency(
                      selectedBundle.price.amount,
                      selectedBundle.price.currency
                    )}
                  </p>
                </div>

                <div className='text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Costo Total
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {formatCurrency(
                      selectedBundle.cost.amount,
                      selectedBundle.cost.currency
                    )}
                  </p>
                </div>

                <div className='text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Ganancia
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    {formatCurrency(profit, selectedBundle.price.currency)}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Margen: {profitMargin}%
                  </p>
                </div>
              </div>

              <Separator className='my-4' />

              <div className='text-sm text-muted-foreground'>
                <p>
                  <strong>Costo estimado de items:</strong>{' '}
                  {formatCurrency(totalItemsCost, 'MXN')}
                </p>
                {totalItemsCost !== selectedBundle.cost.amount && (
                  <p className='text-amber-600'>
                    ⚠️ El costo del paquete (
                    {formatCurrency(
                      selectedBundle.cost.amount,
                      selectedBundle.cost.currency
                    )}
                    ) difiere del costo estimado de items (
                    {formatCurrency(totalItemsCost, 'MXN')})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items del Bundle */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Items del Paquete ({selectedBundle.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {selectedBundle.items.map((item, index) => {
                  const details = getItemDetails(item)
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        {item.type === 'product' ? (
                          <Package className='h-5 w-5 text-blue-500' />
                        ) : (
                          <Wrench className='h-5 w-5 text-green-500' />
                        )}

                        <div>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium'>{details.name}</p>
                            <Badge
                              variant='outline'
                              className={
                                item.type === 'product'
                                  ? 'text-blue-600'
                                  : 'text-green-600'
                              }
                            >
                              {item.type === 'product'
                                ? 'Producto'
                                : 'Servicio'}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <span>
                              Precio unitario:{' '}
                              {formatCurrency(details.price, details.currency)}
                            </span>
                            {item.type === 'product' && details.sku && (
                              <span>SKU: {details.sku}</span>
                            )}
                            {item.type === 'service' && details.duration && (
                              <span>
                                Duración: {details.duration.value} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='text-right'>
                        <p className='font-medium'>Cantidad: {item.quantity}</p>
                        <p className='text-sm text-muted-foreground'>
                          Subtotal:{' '}
                          {formatCurrency(
                            details.price * item.quantity,
                            details.currency
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Archivos del Paquete */}
          {selectedBundle.files && selectedBundle.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Archivos Adjuntos
                  <Badge variant='secondary' className='ml-2'>
                    {selectedBundle.files.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {selectedBundle.files.map((file, index) => (
                    <div
                      key={index}
                      className='group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-200'
                    >
                      {/* File Icon */}
                      <div className='flex items-center justify-center h-12 w-12 rounded-lg bg-background border'>
                        {getFileIcon(file.type)}
                      </div>

                      {/* File Info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between'>
                          <div className='min-w-0 flex-1'>
                            <h4
                              className='font-medium text-sm truncate mb-1'
                              title={file.filename}
                            >
                              {file.filename || 'Archivo sin nombre'}
                            </h4>
                            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                              {file.mimetype && (
                                <span className='px-2 py-1 bg-background rounded-md font-mono'>
                                  {file.mimetype.split('/')[1]?.toUpperCase() ||
                                    file.mimetype}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            size='sm'
                            variant='ghost'
                            className='opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2'
                            asChild
                          >
                            <a
                              href={file.url}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Eye className='h-4 w-4' />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etiquetas */}
          {bundleTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Tag className='h-5 w-5' />
                  Etiquetas ({bundleTags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {bundleTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant='outline'
                      style={{
                        backgroundColor: tag.color
                          ? `${tag.color}20`
                          : undefined,
                        borderColor: tag.color || undefined,
                        color: tag.color || undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className='flex justify-end gap-4 pt-4'>
          <Button variant='outline' onClick={handleClose}>
            Cerrar
          </Button>
          <Button onClick={handleEdit}>Editar Paquete</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

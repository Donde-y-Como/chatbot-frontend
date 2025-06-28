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
  Edit,
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      <DialogContent className='w-[95vw] max-w-6xl h-[95vh] flex flex-col'>
        <DialogHeader className='flex-shrink-0 space-y-0 pb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20'>
                <Package className='h-6 w-6 text-primary' />
              </div>
              <div>
                <DialogTitle className='text-2xl font-bold text-foreground'>
                  {selectedBundle.name}
                </DialogTitle>
                <DialogDescription className='text-muted-foreground mt-1'>
                  Información detallada del paquete
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={
                selectedBundle.status === 'ACTIVO' ? 'default' : 'secondary'
              }
              className='text-sm px-3 py-1.5'
            >
              {selectedBundle.status}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className='flex-1'>
          <div className='p-6 space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <Card className='shadow-sm border-0 bg-gradient-to-br from-background to-muted/20'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg font-semibold'>
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                        SKU
                      </p>
                      <p className='text-lg font-mono bg-muted/50 px-4 py-3 rounded-lg border'>
                        {selectedBundle.sku}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                        Fecha de creación
                      </p>
                      <p className='text-sm flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-lg border'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
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
                  </div>

                  {selectedBundle.description && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                        Descripción
                      </p>
                      <p className='text-sm leading-relaxed bg-muted/50 px-4 py-4 rounded-lg border'>
                        {selectedBundle.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='shadow-sm border-0 bg-gradient-to-br from-background to-muted/20'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                    <Package className='h-5 w-5 text-primary' />
                    Items del Paquete
                    <Badge variant='secondary' className='ml-2'>
                      {selectedBundle.items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {selectedBundle.items.map((item, index) => {
                      const details = getItemDetails(item)
                      return (
                        <div
                          key={index}
                          className='group flex flex-col lg:flex-row lg:items-center gap-4 p-5 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-200 shadow-sm'
                        >
                          <div className='flex items-center gap-4 flex-1 min-w-0'>
                            <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-background border shadow-sm'>
                              {item.type === 'product' ? (
                                <Package className='h-6 w-6 text-blue-600' />
                              ) : (
                                <Wrench className='h-6 w-6 text-emerald-600' />
                              )}
                            </div>

                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-2'>
                                <p className='font-semibold text-base truncate'>
                                  {details.name}
                                </p>
                                <Badge
                                  variant='outline'
                                  className={
                                    item.type === 'product'
                                      ? 'text-blue-600 border-blue-200 bg-blue-50'
                                      : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                  }
                                >
                                  {item.type === 'product'
                                    ? 'Producto'
                                    : 'Servicio'}
                                </Badge>
                              </div>
                              <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                                <span className='font-medium'>
                                  {formatCurrency(
                                    details.price,
                                    details.currency
                                  )}{' '}
                                  c/u
                                </span>
                                {item.type === 'product' && details.sku && (
                                  <span className='bg-muted/70 px-2 py-1 rounded text-xs font-mono border'>
                                    {details.sku}
                                  </span>
                                )}
                                {item.type === 'service' &&
                                  details.duration && (
                                    <span className='bg-muted/70 px-2 py-1 rounded text-xs border'>
                                      {details.duration.value} min
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center justify-between lg:justify-end gap-4 text-right border-t lg:border-t-0 lg:border-l border-border/30 pt-4 lg:pt-0 lg:pl-4'>
                            <div className='text-right'>
                              <p className='font-medium text-sm text-muted-foreground mb-1'>
                                Cantidad: {item.quantity}
                              </p>
                              <p className='text-xl font-bold text-primary'>
                                {formatCurrency(
                                  details.price * item.quantity,
                                  details.currency
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {selectedBundle.files && selectedBundle.files.length > 0 && (
                <Card className='shadow-sm border-0 bg-gradient-to-br from-background to-muted/20'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                      <FileText className='h-5 w-5 text-primary' />
                      Archivos Adjuntos
                      <Badge variant='secondary' className='ml-2'>
                        {selectedBundle.files.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {selectedBundle.files.map((file, index) => (
                        <div
                          key={index}
                          className='group relative overflow-hidden rounded-lg border border-border/50 bg-card hover:shadow-md transition-all duration-200'
                        >
                          <div className='aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60 p-6'>
                            <div className='flex flex-col items-center text-center space-y-2'>
                              <div className='flex items-center justify-center w-16 h-16 rounded-xl bg-background/80 border shadow-sm'>
                                {getFileIcon(file.type)}
                              </div>
                              <div className='w-full'>
                                <h4
                                  className='font-medium text-sm truncate mb-1'
                                  title={file.filename}
                                >
                                  {file.filename || 'Archivo sin nombre'}
                                </h4>
                                {file.mimetype && (
                                  <span className='text-xs text-muted-foreground bg-background/60 px-2 py-1 rounded font-mono'>
                                    {file.mimetype.split('/')[1]?.toUpperCase() ||
                                      file.mimetype}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                            <Button
                              size='sm'
                              variant='secondary'
                              className='bg-background/90 hover:bg-background text-foreground'
                              asChild
                            >
                              <a
                                href={file.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-2'
                              >
                                <Eye className='h-4 w-4' />
                                Ver archivo
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {bundleTags.length > 0 && (
                <Card className='shadow-sm border-0'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                      <Tag className='h-5 w-5 text-primary' />
                      Etiquetas
                      <Badge variant='secondary' className='ml-2'>
                        {bundleTags.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {bundleTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant='outline'
                          className='px-3 py-1 text-sm'
                          style={{
                            backgroundColor: tag.color
                              ? `${tag.color}15`
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

            <div className='space-y-6'>
              <Card className='shadow-sm border sticky top-0'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                    <Calculator className='h-5 w-5 text-muted-foreground' />
                    Análisis Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid gap-4'>
                    <div className='text-center p-6 bg-card border rounded-lg shadow-sm'>
                      <p className='text-sm font-medium text-muted-foreground mb-2'>
                        Precio de Venta
                      </p>
                      <p className='text-3xl font-bold text-foreground'>
                        {formatCurrency(
                          selectedBundle.price.amount,
                          selectedBundle.price.currency
                        )}
                      </p>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='text-center p-4 bg-muted/30 border rounded-lg shadow-sm'>
                        <p className='text-xs font-medium text-muted-foreground mb-2'>
                          Costo Total
                        </p>
                        <p className='text-xl font-bold text-foreground'>
                          {formatCurrency(
                            selectedBundle.cost.amount,
                            selectedBundle.cost.currency
                          )}
                        </p>
                      </div>

                      <div className='text-center p-4 bg-muted/30 border rounded-lg shadow-sm'>
                        <p className='text-xs font-medium text-muted-foreground mb-2'>
                          Ganancia
                        </p>
                        <p className='text-xl font-bold text-foreground'>
                          {formatCurrency(profit, selectedBundle.price.currency)}
                        </p>
                      </div>
                    </div>

                    <div className='text-center p-3 bg-accent/50 border rounded-lg shadow-sm'>
                      <p className='text-sm font-medium text-accent-foreground'>
                        Margen de Ganancia: <span className='text-lg font-bold'>{profitMargin}%</span>
                      </p>
                    </div>
                  </div>

                  <Separator className='my-4' />

                  <div className='space-y-3'>
                    <div className='p-4 bg-muted/30 rounded-lg border border-muted'>
                      <p className='font-medium text-sm text-muted-foreground mb-2'>
                        Costo estimado de items
                      </p>
                      <p className='text-xl font-bold'>
                        {formatCurrency(totalItemsCost, 'MXN')}
                      </p>
                    </div>

                    {totalItemsCost !== selectedBundle.cost.amount && (
                      <div className='p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
                        <p className='text-amber-700 dark:text-amber-300 text-sm font-medium flex items-center gap-2 mb-2'>
                          <span className='w-2 h-2 bg-amber-500 rounded-full'></span>
                          Diferencia detectada
                        </p>
                        <p className='text-amber-600 dark:text-amber-400 text-sm'>
                          Costo registrado: {formatCurrency(
                            selectedBundle.cost.amount,
                            selectedBundle.cost.currency
                          )}
                        </p>
                        <p className='text-amber-600 dark:text-amber-400 text-sm'>
                          Costo calculado: {formatCurrency(totalItemsCost, 'MXN')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
        </ScrollArea>

        <div className='flex-shrink-0 flex justify-between items-center pt-6 border-t bg-background'>
          <div className='flex gap-3'>
            <Button variant='outline' onClick={handleClose} className='px-6'>
              Cerrar
            </Button>
          </div>
          <Button onClick={handleEdit} className='gap-2 px-6'>
            <Edit className='h-4 w-4' />
            Editar Paquete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
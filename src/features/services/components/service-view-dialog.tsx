import {
  Barcode,
  CalendarIcon,
  Clock,
  Image,
  Info,
  Package,
  Users,
  Wrench,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Service } from '@/features/appointments/types'
import { ProductStatus } from '@/features/products/types.ts'
import { useEquipment } from '@/features/tools/hooks/useEquipment'
import { useConsumables } from '@/features/tools/hooks/useConsumables'

interface Props {
  currentService?: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to format minutes to time with AM/PM (e.g., 540 -> "9:00 AM")
const formatMinutesToTime = (minutes: number): string => {
  const hours24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12 // Convert 0 to 12 for 12 AM
  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`
}

// Spanish day names mapping
const dayNamesInSpanish: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export function ServiceViewDialog({
  currentService,
  open,
  onOpenChange,
}: Props) {
  const { equipment } = useEquipment()
  const { consumables } = useConsumables()

  // Obtener equipos asignados
  const assignedEquipment = equipment.filter(eq => 
    currentService?.equipmentIds?.includes(eq.id)
  )

  // Obtener consumibles asignados con su información completa
  const assignedConsumables = currentService?.consumableUsages?.map(usage => {
    const consumable = consumables.find(c => c.id === usage.consumableId)
    return consumable ? { ...consumable, quantity: usage.quantity } : null
  }).filter((item): item is NonNullable<typeof item> => item !== null) || []
  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg md:max-w-xl lg:max-w-3xl mx-auto'>
        <DialogHeader className='text-left'>
          <DialogTitle aria-label='View Service Details'>
            Detalles de Servicio
          </DialogTitle>
          <DialogDescription>
            Ver información detallada sobre este servicio.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area with accessibility improvements */}
        <ScrollArea className='h-[30rem] w-full pr-4 -mr-4 py-1'>
          {currentService ? (
            <div className='space-y-4'>
              <Card>
                <CardContent className='p-4'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between'>
                    <div>
                      <h3 className='text-xl font-semibold'>
                        {currentService.name}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        SKU: {currentService.productInfo.sku}
                      </p>
                    </div>
                    <div className='mt-2 md:mt-0'>
                      <Badge className='text-lg bg-primary/20 text-primary hover:bg-primary/30 py-1.5 px-3'>
                        {formatCurrency(
                          currentService.price.amount,
                          currentService.price.currency
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Service Description */}
                <Card className='md:col-span-2'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Info className='h-5 w-5 text-muted-foreground' />
                      <h3 className='font-medium'>Descripción</h3>
                    </div>
                    <Separator className='mb-3' />
                    <p className='text-sm text-muted-foreground'>
                      {currentService.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Duration Info */}
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Clock className='h-5 w-5 text-muted-foreground' />
                      <h3 className='font-medium'>Duración</h3>
                    </div>
                    <Separator className='mb-3' />
                    <div className='text-sm text-muted-foreground'>
                      <p>
                        {currentService.duration.value}{' '}
                        {currentService.duration.unit === 'minutes'
                          ? 'minutos'
                          : 'horas'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity Info */}
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Users className='h-5 w-5 text-muted-foreground' />
                      <h3 className='font-medium'>Capacidad</h3>
                    </div>
                    <Separator className='mb-3' />
                    <p className='text-sm text-muted-foreground'>
                      Capacidad maxima de asistentes:{' '}
                      {currentService.maxConcurrentBooks}
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Horas mínimas de anticipación:{' '}
                      {currentService.minBookingLeadHours}h
                    </p>
                  </CardContent>
                </Card>

                {/* Product Info */}
                <Card className='md:col-span-2'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Package className='h-5 w-5 text-muted-foreground' />
                      <h3 className='font-medium'>Detalles del Servicio</h3>
                    </div>
                    <Separator className='mb-3' />
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='font-medium'>Estado:</span>
                        <Badge
                          variant={
                            currentService.productInfo.status ===
                            ProductStatus.ACTIVO
                              ? 'default'
                              : 'secondary'
                          }
                          className='ml-2'
                        >
                          {currentService.productInfo.status ===
                          ProductStatus.ACTIVO
                            ? 'Activo'
                            : 'Inactivo'}
                        </Badge>
                      </div>
                      <div>
                        <span className='font-medium'>Descuento:</span>
                        <span className='ml-2 text-muted-foreground'>
                          {currentService.productInfo.discountPercentage}%
                        </span>
                      </div>
                      <div>
                        <span className='font-medium'>Impuesto:</span>
                        <span className='ml-2 text-muted-foreground'>
                          {currentService.productInfo.taxPercentage}%
                        </span>
                      </div>
                      <div>
                        <span className='font-medium'>Costo:</span>
                        <span className='ml-2 text-muted-foreground'>
                          {formatCurrency(
                            currentService.productInfo.cost.amount,
                            currentService.productInfo.cost.currency
                          )}
                        </span>
                      </div>
                    </div>
                    {currentService.productInfo.notes && (
                      <div className='mt-3'>
                        <span className='font-medium text-sm'>Notas:</span>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {currentService.productInfo.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Barcode and Unit */}
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Barcode className='h-5 w-5 text-muted-foreground' />
                      <h3 className='font-medium'>Código de Barras</h3>
                    </div>
                    <Separator className='mb-3' />
                    <p className='text-sm font-mono text-muted-foreground'>
                      {currentService.codigoBarras || 'N/A'}
                    </p>
                  </CardContent>
                </Card>

                {/* Equipment Section */}
                {assignedEquipment.length > 0 && (
                  <Card className='md:col-span-2'>
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Wrench className='h-5 w-5 text-muted-foreground' />
                        <h3 className='font-medium'>Equipos Requeridos</h3>
                        <Badge variant='outline' className='ml-2'>
                          {assignedEquipment.length}
                        </Badge>
                      </div>
                      <Separator className='mb-3' />
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {assignedEquipment.map((eq) => (
                          <div
                            key={eq.id}
                            className='flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-primary/5'
                          >
                            <div className='flex items-center justify-center w-8 h-8 rounded-md bg-muted'>
                              <Wrench className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-medium text-sm'>{eq.name}</h4>
                              <div className='flex gap-2 text-xs text-muted-foreground mt-0.5'>
                                {eq.category && (
                                  <span>{eq.category}</span>
                                )}
                                {eq.brand && (
                                  <>
                                    {eq.category && <span>•</span>}
                                    <span>{eq.brand}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge variant='outline' className='text-xs'>
                              {eq.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Consumables Section */}
                {assignedConsumables.length > 0 && (
                  <Card className='md:col-span-2'>
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Package className='h-5 w-5 text-muted-foreground' />
                        <h3 className='font-medium'>Consumibles Requeridos</h3>
                        <Badge variant='outline' className='ml-2'>
                          {assignedConsumables.reduce((total, consumable) => total + consumable.quantity, 0)}
                        </Badge>
                      </div>
                      <Separator className='mb-3' />
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {assignedConsumables.map((consumable) => (
                          <div
                            key={consumable.id}
                            className='flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-primary/5'
                          >
                            <div className='flex items-center justify-center w-8 h-8 rounded-md bg-muted'>
                              <Package className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-medium text-sm'>{consumable.name}</h4>
                              <div className='flex gap-2 text-xs text-muted-foreground mt-0.5'>
                                {consumable.category && (
                                  <span>{consumable.category}</span>
                                )}
                                {consumable.brand && (
                                  <>
                                    {consumable.category && <span>•</span>}
                                    <span>{consumable.brand}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                Cantidad: {consumable.quantity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Photos */}
                {currentService.photos && currentService.photos.length > 0 && (
                  <Card className='md:col-span-2'>
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Image className='h-5 w-5 text-muted-foreground' />
                        <h3 className='font-medium'>Fotos del Servicio</h3>
                      </div>
                      <Separator className='mb-3' />
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                        {currentService.photos.map((photo, index) => (
                          <div
                            key={index}
                            className='aspect-square overflow-hidden rounded-md border'
                          >
                            <img
                              src={photo}
                              alt={`Foto ${index + 1} del servicio`}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Schedule Info */}
                <Card className='md:col-span-2'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                      <h3 className='font-medium'>Horarios</h3>
                    </div>
                    <Separator className='mb-3' />
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                      {Object.entries(currentService.schedule).map(
                        ([day, timeRange]) => (
                          <div
                            key={day}
                            className='flex flex-col p-2 border rounded-md'
                          >
                            <span className='font-medium'>
                              {dayNamesInSpanish[day.toLowerCase()] || day}
                            </span>
                            <span className='text-sm text-muted-foreground flex items-center gap-1'>
                              <Clock className='h-3.5 w-3.5' />{' '}
                              {formatMinutesToTime(timeRange.startAt)} -{' '}
                              {formatMinutesToTime(timeRange.endAt)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p className='text-muted-foreground'>No service selected</p>
            </div>
          )}
        </ScrollArea>

        {/* Dialog Footer with Button */}
        <DialogFooter className='sm:justify-end mt-4'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            aria-label='Close'
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

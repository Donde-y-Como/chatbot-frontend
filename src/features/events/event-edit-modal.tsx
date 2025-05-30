import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker.tsx'
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'
import { useUploadMedia } from '../chats/hooks/useUploadMedia'
import {
  EndCondition,
  EventPrimitives,
  Frequency,
} from '@/features/events/types'
import { ProductInfo, ProductStatus, getDefaultProductInfo } from '@/types'
import { CategorySelector, TagSelector } from '@/components/product-info'
import { useGetCategories } from '@/features/settings/categories/hooks/useCategories'
import { useGetTags } from '@/features/settings/tags/hooks/useTags'

type EditableEvent = Partial<EventPrimitives>

export function EventEditModal({
  event,
  open,
  onClose,
  onSave,
}: {
  event: EventPrimitives
  open: boolean
  onClose: () => void
  onSave: (changes: EditableEvent) => void
}) {
  const [changes, setChanges] = React.useState<EditableEvent>({})
  const [photos, setPhotos] = React.useState<File[]>([])
  const { uploadFile, validateFile, isUploading } = useUploadMedia()

  // Resetear cambios cuando se abre el modal
  React.useEffect(() => {
    if (open) {
      setChanges({})
      setPhotos([])
    }
  }, [open])

  // Función para manejar cancelación
  const handleCancel = () => {
    setChanges({})
    setPhotos([])
    onClose()
  }

  const updateField = <K extends keyof EventPrimitives>(
    field: K,
    value: EventPrimitives[K]
  ) => {
    setChanges((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = React.useCallback(
    async (file: File) => {
      const { isValid } = validateFile(file)
      if (!isValid) {
        toast.error("El archivo no es válido")
        return
      }

      try {
        const url = await uploadFile(file)
        updateField('photos', [...(changes.photos || event.photos), url])
      } catch (error) {
        toast.error("Hubo un error al subir la imagen")
      }
    },
    [uploadFile, validateFile, changes.photos, event.photos]
  )

  React.useEffect(() => {
    if (photos.length > 0) {
      const uploadPhotos = async () => {
        for (const photo of photos) {
          await handleImageUpload(photo)
        }
        setPhotos([])
      }
      uploadPhotos()
    }
  }, [photos, handleImageUpload])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCancel() // Resetear cambios al cerrar
      }
    }}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>

        <DialogDescription className="sr-only">Editar evento</DialogDescription>

        <Tabs defaultValue='general' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='capacity'>Capacidad</TabsTrigger>
            <TabsTrigger value='schedule'>Horario</TabsTrigger>
            <TabsTrigger value='product'>Producto</TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Nombre del Evento</Label>
              <Input
                id='name'
                placeholder='Ej: Clase de Yoga'
                defaultValue={event.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Descripción</Label>
              <Textarea
                id='description'
                placeholder='Describe tu evento...'
                defaultValue={event.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='location'>Ubicación</Label>
              <Textarea
                id='location'
                defaultValue={event.location}
                placeholder='Virtual o dirección física'
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label>Precio</Label>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  placeholder='0.00'
                  defaultValue={event.price.amount}
                  onChange={(e) =>
                    updateField('price', {
                      currency: changes.price?.currency ?? event.price.currency,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
                <Select
                  defaultValue={event.price.currency}
                  onValueChange={(value) =>
                    updateField('price', {
                      amount: changes.price?.amount ?? event.price.amount,
                      currency: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='EUR'>EUR</SelectItem>
                    <SelectItem value='MXN'>MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label>Fotos</Label>
              <div className="mb-2">
                <FileUpload
                  maxFiles={5}
                  maxSize={100 * 1024 * 1024}
                  value={photos}
                  onChange={setPhotos}
                />
              </div>
              {event.photos.length > 0 && (
                <div className="mt-2">
                  <Label>Fotos actuales</Label>
                  <div className="mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {(changes.photos || event.photos).map((photoUrl, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-background">
                        <img
                          src={photoUrl}
                          alt={`Foto ${index + 1}`}
                          className="h-full w-full object-cover transition-all hover:opacity-80"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => {
                            const updatedPhotos = [...(changes.photos || event.photos)]
                            updatedPhotos.splice(index, 1)
                            updateField('photos', updatedPhotos)
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='capacity' className='space-y-4'>
            <div className='grid gap-2'>
              <Label>Límite de Capacidad</Label>
              <div className='flex items-center gap-4'>
                <Switch
                  id='isLimited'
                  checked={
                    changes.capacity?.isLimited ?? event.capacity.isLimited
                  }
                  onCheckedChange={(checked) =>
                    updateField('capacity', {
                      ...event.capacity,
                      isLimited: checked,
                      maxCapacity: checked
                        ? event.capacity.maxCapacity || 1
                        : undefined,
                    })
                  }
                />
                <Label htmlFor='isLimited'>Capacidad Limitada</Label>
              </div>

              {(changes.capacity?.isLimited ?? event.capacity.isLimited) && (
                <div className='grid gap-2'>
                  <Label htmlFor='maxCapacity'>Capacidad Máxima</Label>
                  <Input
                    id='maxCapacity'
                    type='number'
                    min='1'
                    placeholder='Número de participantes'
                    defaultValue={event.capacity.maxCapacity ?? 0}
                    onChange={(e) =>
                      updateField('capacity', {
                        isLimited: true,
                        maxCapacity: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='schedule' className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label>Duración</Label>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label htmlFor='startAt'>Inicio</Label>
                    <DateTimePicker
                      htmlId={'startAt'}
                      defaultValue={new Date(event.duration.startAt)}
                      onChange={(date: Date) => {
                        updateField('duration', {
                          endAt:
                            changes.duration?.endAt ?? event.duration.endAt,
                          startAt: date.toISOString(),
                        })
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor='endAt'>Fin</Label>
                    <DateTimePicker
                      htmlId={'endAt'}
                      defaultValue={new Date(event.duration.endAt)}
                      onChange={(date: Date) => {
                        updateField('duration', {
                          startAt:
                            changes.duration?.startAt ?? event.duration.startAt,
                          endAt: date.toISOString(),
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className='grid gap-2'>
                <Label>Recurrencia</Label>
                <Select
                  defaultValue={
                    changes.recurrence?.frequency ?? event.recurrence.frequency
                  }
                  onValueChange={(value: Frequency) =>
                    updateField('recurrence', {
                      frequency: value,
                      endCondition:
                        value === 'never'
                          ? null
                          : event.recurrence.endCondition,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='never'>Nunca</SelectItem>
                    <SelectItem value='daily'>Diario</SelectItem>
                    <SelectItem value='weekly'>Semanal</SelectItem>
                    <SelectItem value='monthly'>Mensual</SelectItem>
                    <SelectItem value='yearly'>Anual</SelectItem>
                  </SelectContent>
                </Select>

                {(changes.recurrence?.frequency ??
                  event.recurrence.frequency) !== 'never' && (
                  <div className='grid gap-2'>
                    <Label>Finalización</Label>
                    <Select
                      defaultValue={
                        (changes.recurrence?.endCondition?.type ??
                          event.recurrence.endCondition?.type) ||
                        'null'
                      }
                      onValueChange={(value) => {
                        let endCondition: EndCondition = null
                        if (value === 'occurrences') {
                          endCondition = { type: 'occurrences', occurrences: 1 }
                        } else if (value === 'date') {
                          endCondition = { type: 'date', until: new Date() }
                        }
                        updateField('recurrence', {
                          ...event.recurrence,
                          ...changes.recurrence,
                          endCondition,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='null'>Sin fecha final</SelectItem>
                        <SelectItem value='occurrences'>
                          Después de varias ocurrencias
                        </SelectItem>
                        <SelectItem value='date'>
                          En fecha específica
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {(changes.recurrence?.endCondition?.type ??
                      event.recurrence.endCondition?.type) ===
                      'occurrences' && (
                      <div className='grid gap-2'>
                        <Label>Número de Ocurrencias</Label>
                        <Input
                          type='number'
                          min='1'
                          placeholder='Ej: 10'
                          value={
                            changes.recurrence?.endCondition?.type ===
                            'occurrences'
                              ? changes.recurrence.endCondition.occurrences
                              : event.recurrence.endCondition?.type ===
                                  'occurrences'
                                ? event.recurrence.endCondition.occurrences
                                : ''
                          }
                          onChange={(e) =>
                            updateField('recurrence', {
                              ...event.recurrence,
                              ...changes.recurrence,
                              endCondition: {
                                type: 'occurrences',
                                occurrences: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}

                    {(changes.recurrence?.endCondition?.type ??
                      event.recurrence.endCondition?.type) === 'date' && (
                      <div className='grid gap-2'>
                        <Label>Fecha Final</Label>
                        <Input
                          type='date'
                          value={
                            changes.recurrence?.endCondition?.type === 'date'
                              ? changes.recurrence.endCondition.until
                                  .toISOString()
                                  .slice(0, 10)
                              : event.recurrence.endCondition?.type === 'date'
                                ? new Date(event.recurrence.endCondition.until)
                                    .toISOString()
                                    .slice(0, 10)
                                : ''
                          }
                          onChange={(e) =>
                            updateField('recurrence', {
                              ...event.recurrence,
                              ...changes.recurrence,
                              endCondition: {
                                type: 'date',
                                until: new Date(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Product Info Tab */}
          <TabsContent value='product' className='space-y-4'>
            <div className='grid gap-4'>
              {/* SKU y Estado */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='sku'>SKU (Código del producto)</Label>
                  <Input
                    id='sku'
                    placeholder='Ej: EVT-YOGA-001'
                    defaultValue={event.productInfo?.sku || ''}
                    onChange={(e) => 
                      updateField('productInfo', {
                        ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                        sku: e.target.value
                      })
                    }
                    className='font-mono'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='status'>Estado del producto</Label>
                  <Select
                    defaultValue={event.productInfo?.status || ProductStatus.ACTIVE}
                    onValueChange={(value: ProductStatus) =>
                      updateField('productInfo', {
                        ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                        status: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.ACTIVE}>
                        Activo - Disponible para venta
                      </SelectItem>
                      <SelectItem value={ProductStatus.INACTIVE}>
                        Inactivo - No disponible temporalmente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categorías */}
              <div className='grid gap-2'>
                <Label>Categorías</Label>
                <CategorySelector
                  selectedCategoryIds={changes.productInfo?.categoryIds || event.productInfo?.categoryIds || []}
                  selectedSubcategoryIds={changes.productInfo?.subcategoryIds || event.productInfo?.subcategoryIds || []}
                  onCategoryChange={(categoryIds) =>
                    updateField('productInfo', {
                      ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                      categoryIds
                    })
                  }
                  onSubcategoryChange={(subcategoryIds) =>
                    updateField('productInfo', {
                      ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                      subcategoryIds
                    })
                  }
                />
              </div>

              {/* Etiquetas */}
              <div className='grid gap-2'>
                <Label>Etiquetas</Label>
                <TagSelector
                  selectedTagIds={changes.productInfo?.tagIds || event.productInfo?.tagIds || []}
                  onTagChange={(tagIds) =>
                    updateField('productInfo', {
                      ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                      tagIds
                    })
                  }
                />
              </div>

              {/* Descuento e Impuestos */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='discount'>Descuento (%)</Label>
                  <Input
                    id='discount'
                    type='number'
                    min='0'
                    max='100'
                    step='0.01'
                    placeholder='0'
                    defaultValue={event.productInfo?.discountPercentage || 0}
                    onChange={(e) =>
                      updateField('productInfo', {
                        ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                        discountPercentage: Number(e.target.value) || 0
                      })
                    }
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='tax'>Impuesto (%)</Label>
                  <Input
                    id='tax'
                    type='number'
                    min='0'
                    step='0.01'
                    placeholder='0'
                    defaultValue={event.productInfo?.taxPercentage || 0}
                    onChange={(e) =>
                      updateField('productInfo', {
                        ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                        taxPercentage: Number(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>

              {/* Costo del negocio */}
              <div className='space-y-4'>
                <div>
                  <Label className='text-base font-medium'>Costo del negocio</Label>
                  <p className='text-sm text-muted-foreground'>
                    Costo interno para calcular márgenes (diferente al precio de venta)
                  </p>
                </div>
                
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='costAmount'>Monto del costo</Label>
                    <Input
                      id='costAmount'
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='0.00'
                      defaultValue={event.productInfo?.cost?.amount || 0}
                      onChange={(e) => {
                        const currentProductInfo = changes.productInfo || event.productInfo || getDefaultProductInfo()
                        updateField('productInfo', {
                          ...currentProductInfo,
                          cost: {
                            ...currentProductInfo.cost,
                            amount: Number(e.target.value) || 0
                          }
                        })
                      }}
                    />
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='costCurrency'>Moneda del costo</Label>
                    <Select
                      defaultValue={event.productInfo?.cost?.currency || 'MXN'}
                      onValueChange={(value) => {
                        const currentProductInfo = changes.productInfo || event.productInfo || getDefaultProductInfo()
                        updateField('productInfo', {
                          ...currentProductInfo,
                          cost: {
                            ...currentProductInfo.cost,
                            currency: value
                          }
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='MXN'>MXN</SelectItem>
                        <SelectItem value='USD'>USD</SelectItem>
                        <SelectItem value='EUR'>EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notas adicionales */}
              <div className='grid gap-2'>
                <Label htmlFor='notes'>Notas adicionales</Label>
                <Textarea
                  id='notes'
                  placeholder='Información adicional sobre el producto, restricciones, requerimientos especiales, etc.'
                  rows={3}
                  defaultValue={event.productInfo?.notes || ''}
                  onChange={(e) =>
                    updateField('productInfo', {
                      ...(changes.productInfo || event.productInfo || getDefaultProductInfo()),
                      notes: e.target.value
                    })
                  }
                />
                <p className='text-sm text-muted-foreground'>
                  Máximo 500 caracteres
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(changes)
              handleCancel() // Resetear al guardar
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

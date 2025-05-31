import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useCallback, useMemo } from 'react'
import { useCreateService, useUpdateService, ServiceFormData } from './service-mutations'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SelectDropdown } from '@/components/select-dropdown'
import { Service } from '@/features/appointments/types'
import { scheduleSchema } from '../../employees/types'
import { ScheduleSection } from '../../employees/components/form/schedule-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/file-upload'
import { useUploadMedia } from '../../chats/hooks/useUploadMedia'
import { toast } from 'sonner'
import { getDefaultProductInfo } from '@/types'
import { ProductInfoStep } from '@/components/product-info'
import { useGetUnits } from '../hooks/useGetUnits'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as React from 'react'

// Form validation schema actualizado con los nuevos campos
const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El nombre del servicio es obligatorio.' }),
  description: z.string().min(1, { message: 'La descripción es obligatoria.' }),
  durationValue: z.coerce
    .number()
    .min(1, { message: 'La duración debe ser al menos 1.' }),
  durationUnit: z.enum(['minutes', 'hours']),
  priceAmount: z.coerce
    .number()
    .min(0, { message: 'El precio debe ser al menos 0.' }),
  priceCurrency: z.string().min(1, { message: 'La moneda es obligatoria.' }),
  maxConcurrentBooks: z.coerce
    .number()
    .min(1, { message: 'Debe permitir al menos 1 reserva.' }),
  minBookingLeadHours: z.coerce.number().min(0, {
    message: 'El tiempo mínimo de anticipación debe ser de al menos 0 horas.',
  }),
  schedule: scheduleSchema,
  // Nuevos campos
  productInfo: z.object({
    sku: z.string().min(1, 'El SKU es requerido'),
    discountPercentage: z.number().min(0, 'El descuento no puede ser negativo').max(100, 'El descuento no puede exceder 100%'),
    categoryIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una categoría'),
    subcategoryIds: z.array(z.string()).default([]),
    status: z.enum(['active', 'inactive']),
    tagIds: z.array(z.string()).default([]),
    taxPercentage: z.number().min(0, 'El impuesto no puede ser negativo'),
    notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').default(''),
    cost: z.object({
      amount: z.number().min(0, 'El costo no puede ser negativo'),
      currency: z.string().min(1, 'La moneda es requerida'),
    }),
    precioModificado: z.object({
      amount: z.number().min(0, 'El precio modificado no puede ser negativo'),
      currency: z.string().min(1, 'La moneda es requerida'),
    }),
  }),
  codigoBarras: z.coerce
    .number()
    .int('El código de barras debe ser un número entero')
    .positive('El código de barras debe ser positivo'),
  unidadMedida: z.object({
    id: z.string().min(1, 'Debe seleccionar una unidad de medida'),
    name: z.string(),
    abbreviation: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
  photos: z.array(z.string()),
})

type ServiceForm = z.infer<typeof formSchema>

interface Props {
  currentService?: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceActionDialog({
  currentService,
  open,
  onOpenChange,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photos, setPhotos] = React.useState<File[]>([])
  const isEdit = !!currentService
  
  const { data: units = [], isLoading: unitsLoading } = useGetUnits()
  const { uploadFile, validateFile, isUploading } = useUploadMedia()

  // Create memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => {
    return isEdit
      ? {
        ...currentService,
        durationValue: currentService.duration.value,
        durationUnit: currentService.duration.unit,
        priceAmount: currentService.price.amount,
        priceCurrency: currentService.price.currency,
        schedule: currentService.schedule,
        productInfo: currentService.productInfo,
        codigoBarras: Number(currentService.codigoBarras) || 0,
        unidadMedida: currentService.unidadMedida,
        photos: currentService.photos,
      }
      : {
        name: '',
        description: '',
        durationValue: 30,
        durationUnit: 'minutes' as const,
        priceAmount: 0,
        priceCurrency: 'MXN',
        maxConcurrentBooks: 1,
        minBookingLeadHours: 0,
        schedule: {
          MONDAY: { startAt: 480, endAt: 1020 },
          TUESDAY: { startAt: 480, endAt: 1020 },
          WEDNESDAY: { startAt: 480, endAt: 1020 },
          THURSDAY: { startAt: 480, endAt: 1020 },
          FRIDAY: { startAt: 480, endAt: 1020 },
        },
        productInfo: {
          ...getDefaultProductInfo(),
          sku: '',
          categoryIds: [],
          subcategoryIds: [],
          tagIds: [],
          notes: '',
        },
        codigoBarras: 0,
        unidadMedida: {
          id: '',
          name: '',
          abbreviation: '',
          createdAt: '',
          updatedAt: '',
        },
        photos: [],
      }
  }, [currentService, isEdit])

  const form = useForm<ServiceForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form when dialog closes or when switching between create/edit
  const handleOpenChange = useCallback((state: boolean) => {
    if (!state) {
      form.reset()
      setPhotos([])
    }
    onOpenChange(state)
  }, [form, onOpenChange])

  // Handler for form submission success
  const handleSuccess = useCallback(() => {
    form.reset()
    setPhotos([])
    handleOpenChange(false)
    setIsSubmitting(false)
  }, [form, handleOpenChange])

  // Handle image upload
  const handleImageUpload = React.useCallback(
    async (file: File) => {
      const { isValid } = validateFile(file)
      if (!isValid) {
        form.setError("photos", { message: "Algún archivo no es válido" })
        toast.error("El archivo no es válido")
        return
      }

      try {
        const url = await uploadFile(file)
        form.setValue("photos", [...form.getValues("photos"), url])
      } catch (error) {
        toast.error("Hubo un error al subir la imagen")
      }
    },
    [uploadFile, validateFile, form],
  )

  // Create service mutation
  const createService = useCreateService({
    onSuccess: handleSuccess
  })

  // Update service mutation
  const updateService = useUpdateService({
    onSuccess: handleSuccess
  })

  const onSubmit = async (values: ServiceForm) => {
    setIsSubmitting(true)

    // Upload photos if any
    if (photos.length > 0) {
      for (const photo of photos) {
        await handleImageUpload(photo)
      }
    }

    if (isEdit && currentService) {
      updateService.mutate({
        id: currentService.id,
        formData: values as ServiceFormData
      })
    } else {
      createService.mutate(values as ServiceFormData)
    }
  }

  // Time unit options for dropdown
  const durationOptions = useMemo(() => [
    { label: 'Minutos', value: 'minutes' },
    { label: 'Horas', value: 'hours' },
  ], [])

  // Currency options
  const currencyOptions = useMemo(() => [
    { label: 'MXN', value: 'MXN' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
  ], [])

  // Check if there are filled fields
  const hasFilledFields = React.useCallback(() => {
    const formValues = form.getValues();
    const productInfo = formValues.productInfo;
    
    return (
      formValues.name !== '' || 
      formValues.description !== '' || 
      formValues.priceAmount !== 0 ||
      formValues.durationValue !== 30 ||
      formValues.maxConcurrentBooks !== 1 ||
      formValues.minBookingLeadHours !== 0 ||
      formValues.codigoBarras !== 0 ||
      formValues.unidadMedida.id !== '' ||
      photos.length > 0 ||
      productInfo?.sku !== '' ||
      productInfo?.categoryIds.length > 0 ||
      productInfo?.subcategoryIds.length > 0 ||
      productInfo?.tagIds.length > 0 ||
      productInfo?.discountPercentage !== 0 ||
      productInfo?.taxPercentage !== 0 ||
      productInfo?.cost.amount !== 0 ||
      productInfo?.notes !== ''
    );
  }, [form, photos]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Si está cerrando (isOpen === false) y hay campos rellenados, prevenimos el cierre
      if (!isOpen && hasFilledFields()) {
        return;
      }
      // En caso contrario, permitimos el cierre y llamamos a handleOpenChange
      !isOpen && handleOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle aria-label={isEdit ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}>
                {isEdit ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Actualiza la información del servicio aquí.'
                  : 'Crea un nuevo servicio para tus clientes aquí.'}{' '}
                Haz clic en guardar cuando termines.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Precio</TabsTrigger>
                <TabsTrigger value="product">Producto</TabsTrigger>
                <TabsTrigger value="schedule">Horario</TabsTrigger>
                <TabsTrigger value="photos">Fotos</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4 pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name">Nombre del Servicio</FormLabel>
                          <FormControl>
                            <Input
                              id="name"
                              placeholder="Ej: Mantenimiento de equipo"
                              {...field}
                              aria-required="true"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="description">Descripción</FormLabel>
                          <FormControl>
                            <Input
                              id="description"
                              placeholder="Descripción del servicio"
                              {...field}
                              aria-required="true"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="durationValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="durationValue">Duración</FormLabel>
                            <FormControl>
                              <Input
                                id="durationValue"
                                type="number"
                                placeholder="Valor de la duración"
                                min={1}
                                {...field}
                                aria-required="true"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="durationUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="durationUnit">Unidad de Duración</FormLabel>
                            <SelectDropdown
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              items={durationOptions}
                              aria-required="true"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxConcurrentBooks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="maxConcurrentBooks">Máximo de Reservas Concurrentes</FormLabel>
                            <FormControl>
                              <Input
                                id="maxConcurrentBooks"
                                type="number"
                                placeholder="Número máximo de reservas"
                                min={1}
                                {...field}
                                aria-required="true"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minBookingLeadHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="minBookingLeadHours">Horas Mínimas de Anticipación</FormLabel>
                            <FormControl>
                              <Input
                                id="minBookingLeadHours"
                                type="number"
                                placeholder="Horas mínimas para reservar"
                                min={0}
                                {...field}
                                aria-required="true"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="codigoBarras"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="codigoBarras">Código de Barras</FormLabel>
                            <FormControl>
                              <Input
                                id="codigoBarras"
                                type="number"
                                placeholder="Ej: 1234567890123"
                                {...field}
                                value={field.value || ''}
                                onFocus={(e) => {
                                  if (field.value === 0) {
                                    field.onChange('')
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(value === '' ? 0 : Number(value))
                                }}
                                aria-required="true"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unidadMedida"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="unidadMedida">Unidad de Medida</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value?.id || ''}
                                onValueChange={(value) => {
                                  const selectedUnit = units.find(unit => unit.id === value)
                                  if (selectedUnit) {
                                    field.onChange(selectedUnit)
                                  }
                                }}
                                disabled={unitsLoading}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar unidad de medida" />
                                </SelectTrigger>
                                <SelectContent>
                                  {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                      {unit.name} ({unit.abbreviation})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4 pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priceAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="priceAmount">Precio</FormLabel>
                            <FormControl>
                              <Input
                                id="priceAmount"
                                type="number"
                                placeholder="0.00"
                                min={0}
                                step="0.01"
                                {...field}
                                value={field.value || ''}
                                onFocus={(e) => {
                                  if (field.value === 0) {
                                    field.onChange(undefined);
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? undefined : Number(value));
                                }}
                                aria-required="true"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priceCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="priceCurrency">Moneda</FormLabel>
                            <SelectDropdown
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              items={currencyOptions}
                              aria-required="true"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Product Info Tab */}
              <TabsContent value="product" className="space-y-4 pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <ProductInfoStep />
                </ScrollArea>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4 pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <FormLabel htmlFor="schedule">Horario del Servicio</FormLabel>
                    <div className='-mx-2'>
                      <ScheduleSection form={form} />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-4 pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <FormLabel>Fotos del Servicio</FormLabel>
                    <FileUpload
                      maxFiles={5}
                      maxSize={100 * 1024 * 1024}
                      value={photos}
                      onChange={setPhotos}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting || isUploading}
                aria-label="Cancelar"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                aria-label={isEdit ? "Actualizar servicio" : "Crear servicio"}
                className="min-w-24"
              >
                {isSubmitting || isUploading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

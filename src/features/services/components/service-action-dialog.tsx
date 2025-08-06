import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Search, X, Package, Wrench, Plus, Minus, AlertCircle } from 'lucide-react'
import { getDefaultProductInfo } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/file-upload'
import { ProductInfoStep } from '@/components/product-info'
import { SelectDropdown } from '@/components/select-dropdown'
import { MinutesTimeRange, Service } from '@/features/appointments/types'
import { ProductStatus } from '@/features/products/types.ts'
import { ScheduleService } from '@/features/settings/profile/ProfileService.ts'
import { useEquipment } from '@/features/tools/hooks/useEquipment'
import { useConsumables } from '@/features/tools/hooks/useConsumables'
import { Equipment, EquipmentStatus, Consumable } from '@/features/tools/types'
import { useUploadMedia } from '../../chats/hooks/useUploadMedia'
import { ScheduleSection } from '../../employees/components/form/schedule-section'
import { scheduleSchema } from '../../employees/types'
import {
  ServiceFormData,
  useCreateService,
  useUpdateService,
} from './service-mutations'
import { ConsumableUsage } from '../types'

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
    discountPercentage: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return 0
        const num = Number(val)
        return isNaN(num) ? 0 : Math.floor(num) // Asegurar que sea entero
      },
      z
        .number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
    ),
    categoryIds: z.array(z.string()).default([]),
    subcategoryIds: z.array(z.string()).default([]),
    status: z.nativeEnum(ProductStatus),
    tagIds: z.array(z.string()).default([]),
    taxPercentage: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return 0
        const num = Number(val)
        return isNaN(num) ? 0 : Math.floor(num) // Asegurar que sea entero
      },
      z.number().min(0, 'El impuesto no puede ser negativo')
    ),
    notes: z
      .string()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .default(''),
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
  photos: z.array(z.string()),
  // Campos de equipos y consumibles (opcionales)
  equipmentIds: z.array(z.string()).default([]),
  consumableUsages: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  })).default([]),
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
  const [_, setFormSubmitError] = React.useState<string | null>(null)
  
  // Estados para equipos y consumibles
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([])
  const [consumableUsages, setConsumableUsages] = useState<ConsumableUsage[]>([])
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('')
  const [consumablesSearchQuery, setConsumablesSearchQuery] = useState('')
  
  const isEdit = !!currentService
  const { uploadFile, validateFile, isUploading } = useUploadMedia()
  const { equipment, loading: loadingEquipment } = useEquipment()
  const { consumables, loading: loadingConsumables } = useConsumables()

  const userScheduleQuery = useQuery({
    queryKey: ['user-schedule'],
    queryFn: async () => {
      return await ScheduleService.getSchedule()
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const defaultSchedule = useMemo(() => {
    return {
      MONDAY: { startAt: 480, endAt: 1020 },
      TUESDAY: { startAt: 480, endAt: 1020 },
      WEDNESDAY: { startAt: 480, endAt: 1020 },
      THURSDAY: { startAt: 480, endAt: 1020 },
      FRIDAY: { startAt: 480, endAt: 1020 },
    }
  }, [])

  // Get the schedule to use: user's schedule if creating, current service's if editing, or default
  const getInitialSchedule = useCallback(() => {
    if (isEdit && currentService) {
      return currentService.schedule
    }
    if (userScheduleQuery.data?.weeklyWorkDays) {
      return userScheduleQuery.data.weeklyWorkDays
    }
    return defaultSchedule
  }, [
    isEdit,
    currentService,
    userScheduleQuery.data?.weeklyWorkDays,
    defaultSchedule,
  ])

  // Create memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => {
    // Función para normalizar el schedule del backend
    const normalizeSchedule = (schedule: Record<string, MinutesTimeRange>) => {
      const normalized: Record<string, MinutesTimeRange | undefined> = {
        MONDAY: undefined,
        TUESDAY: undefined,
        WEDNESDAY: undefined,
        THURSDAY: undefined,
        FRIDAY: undefined,
        SATURDAY: undefined,
        SUNDAY: undefined,
      }

      // Copiar los días que están configurados
      if (schedule) {
        Object.keys(schedule).forEach((day) => {
          if (
            schedule[day] &&
            typeof schedule[day] === 'object' &&
            'startAt' in schedule[day] &&
            'endAt' in schedule[day]
          ) {
            normalized[day as keyof typeof normalized] = schedule[day]
          }
        })
      }

      return normalized
    }

    return isEdit
      ? {
          ...currentService,
          durationValue: currentService.duration.value,
          durationUnit: currentService.duration.unit,
          priceAmount: currentService.price.amount,
          priceCurrency: currentService.price.currency,
          schedule: normalizeSchedule(currentService.schedule),
          productInfo: currentService.productInfo,
          codigoBarras: Number(currentService.codigoBarras) || 0,
          photos: currentService.photos || [],
          equipmentIds: currentService.equipmentIds || [],
          consumableUsages: currentService.consumableUsages || [],
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
          schedule: getInitialSchedule(),
          productInfo: {
            ...getDefaultProductInfo(),
            sku: '',
            categoryIds: [],
            subcategoryIds: [],
            tagIds: [],
            notes: '',
          },
          codigoBarras: 0,
          photos: [],
          equipmentIds: [],
          consumableUsages: [],
        }
  }, [currentService, getInitialSchedule, isEdit])

  const form = useForm<ServiceForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const { reset } = form

  // Update form schedule when user schedule data is loaded for new services
  useEffect(() => {
    if (!isEdit && userScheduleQuery.data?.weeklyWorkDays && open) {
      form.setValue('schedule', userScheduleQuery.data.weeklyWorkDays)
    }
  }, [userScheduleQuery.data, isEdit, open, form])

  // Reset form when dialog closes or when switching between create/edit
  const handleOpenChange = useCallback(
    (state: boolean) => {
      if (!state) {
        reset()
        setPhotos([])
        setFormSubmitError(null)
        setSelectedEquipmentIds([])
        setConsumableUsages([])
        setEquipmentSearchQuery('')
        setConsumablesSearchQuery('')
      }
      onOpenChange(state)
    },
    [reset, onOpenChange]
  )

  // Reset form when modal is opened/closed - this clears previous errors
  React.useEffect(() => {
    if (open) {
      // Solo llamamos reset con los valores por defecto una vez
      const currentDefaults = isEdit && currentService ? {
        ...currentService,
        durationValue: currentService.duration.value,
        durationUnit: currentService.duration.unit,
        priceAmount: currentService.price.amount,
        priceCurrency: currentService.price.currency,
        schedule: currentService.schedule,
        productInfo: currentService.productInfo,
        codigoBarras: Number(currentService.codigoBarras) || 0,
        photos: currentService.photos || [],
        equipmentIds: currentService.equipmentIds || [],
        consumableUsages: currentService.consumableUsages || [],
      } : defaultValues
      
      reset(currentDefaults)
      setPhotos([])
      setFormSubmitError(null)
      
      // Sincronizar estados con valores por defecto
      if (isEdit && currentService) {
        setSelectedEquipmentIds(currentService.equipmentIds || [])
        setConsumableUsages(currentService.consumableUsages || [])
      } else {
        setSelectedEquipmentIds([])
        setConsumableUsages([])
      }
    }
  }, [open, isEdit, currentService?.id, reset]) // Dependencias mínimas necesarias

  // Funciones para manejar equipos
  const toggleEquipmentSelection = useCallback((equipmentId: string) => {
    setSelectedEquipmentIds(prev => {
      const newIds = prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
      
      // Actualizar el formulario
      form.setValue('equipmentIds', newIds)
      return newIds
    })
  }, [form])

  // Funciones para manejar consumibles
  const updateConsumableUsage = useCallback((consumableId: string, quantity: number) => {
    setConsumableUsages(prev => {
      const newUsages = quantity === 0
        ? prev.filter(usage => usage.consumableId !== consumableId)
        : prev.find(usage => usage.consumableId === consumableId)
          ? prev.map(usage => 
              usage.consumableId === consumableId 
                ? { ...usage, quantity }
                : usage
            )
          : [...prev, { consumableId, quantity }]
      
      // Actualizar el formulario
      form.setValue('consumableUsages', newUsages)
      return newUsages
    })
  }, [form])

  const getConsumableUsage = useCallback((consumableId: string): number => {
    const usage = consumableUsages.find(u => u.consumableId === consumableId)
    return usage?.quantity || 0
  }, [consumableUsages])

  // Funciones de utilidad para consumibles
  const incrementConsumable = useCallback((consumable: Consumable) => {
    const currentUsage = getConsumableUsage(consumable.id)
    if (currentUsage < consumable.stock) {
      updateConsumableUsage(consumable.id, currentUsage + 1)
    }
  }, [getConsumableUsage, updateConsumableUsage])

  const decrementConsumable = useCallback((consumable: Consumable) => {
    const currentUsage = getConsumableUsage(consumable.id)
    if (currentUsage > 0) {
      updateConsumableUsage(consumable.id, currentUsage - 1)
    }
  }, [getConsumableUsage, updateConsumableUsage])

  // Filtros para equipos y consumibles
  const activeEquipment = useMemo(() => {
    if (!equipment?.length) return []
    return equipment.filter((eq) => eq.status === EquipmentStatus.ACTIVE)
  }, [equipment])

  const filteredEquipment = useMemo(() => {
    if (!equipmentSearchQuery.trim()) return activeEquipment
    const query = equipmentSearchQuery.toLowerCase()
    return activeEquipment.filter((eq) =>
      eq.name.toLowerCase().includes(query) ||
      eq.category?.toLowerCase().includes(query) ||
      eq.brand?.toLowerCase().includes(query)
    )
  }, [activeEquipment, equipmentSearchQuery])

  const filteredConsumables = useMemo(() => {
    if (!consumables?.length) return []
    if (!consumablesSearchQuery.trim()) return consumables
    const query = consumablesSearchQuery.toLowerCase()
    return consumables.filter((consumable) =>
      consumable.name.toLowerCase().includes(query) ||
      consumable.category?.toLowerCase().includes(query) ||
      consumable.brand?.toLowerCase().includes(query)
    )
  }, [consumables, consumablesSearchQuery])

  // Handler for form submission success
  const handleSuccess = useCallback(() => {
    reset()
    setPhotos([])
    setFormSubmitError(null)
    handleOpenChange(false)
  }, [reset, handleOpenChange])

  // Handle image upload
  const handleImageUpload = React.useCallback(
    async (file: File) => {
      const { isValid } = validateFile(file)
      if (!isValid) {
        form.setError('photos', { message: 'Algún archivo no es válido' })
        toast.error('El archivo no es válido')
        return
      }

      try {
        const url = await uploadFile(file)
        form.setValue('photos', [...form.getValues('photos'), url])
      } catch (error) {
        toast.error('Hubo un error al subir la imagen')
      }
    },
    [uploadFile, validateFile, form]
  )

  // Create service mutation
  const createService = useCreateService({
    onSuccess: handleSuccess,
  })

  // Update service mutation
  const updateService = useUpdateService({
    onSuccess: handleSuccess,
  })

  const onSubmit = async () => {
    setIsSubmitting(true)
    setFormSubmitError(null)

    const isValid = await form.trigger()
    if (!isValid) {
      setIsSubmitting(false)
      toast.error('Por favor, completa los campos obligatorios')
      return
    }

    // Upload photos if any
    if (photos.length > 0) {
      for (const photo of photos) {
        await handleImageUpload(photo)
      }
    }

    const formData = { ...form.getValues(), equipmentIds: selectedEquipmentIds, consumableUsages }

    if (isEdit && currentService) {
      updateService.mutate({
        id: currentService.id,
        formData: formData as ServiceFormData,
      })
    } else {
      createService.mutate(formData as ServiceFormData)
    }

    setIsSubmitting(false)
  }

  // Time unit options for dropdown
  const durationOptions = useMemo(
    () => [
      { label: 'Minutos', value: 'minutes' },
      { label: 'Horas', value: 'hours' },
    ],
    []
  )

  // Currency options
  const currencyOptions = useMemo(
    () => [
      { label: 'MXN', value: 'MXN' },
      { label: 'USD', value: 'USD' },
      { label: 'EUR', value: 'EUR' },
    ],
    []
  )



  const isLoadingSchedule = !isEdit && userScheduleQuery.isLoading

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className='sm:max-w-4xl'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log('Errores de validación:', errors)
              toast.error('Por favor, completa los campos obligatorios')
            })}
          >
            <DialogHeader>
              <DialogTitle
                aria-label={
                  isEdit ? 'Editar Servicio' : 'Agregar Nuevo Servicio'
                }
              >
                {isEdit ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Actualiza la información del servicio aquí.'
                  : 'Crea un nuevo servicio para tus clientes aquí.'}{' '}
                Haz clic en guardar cuando termines.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='general' className='w-full mt-4'>
              <TabsList className='grid w-full grid-cols-6'>
                <TabsTrigger value='general'>General</TabsTrigger>
                <TabsTrigger value='pricing'>Precio</TabsTrigger>
                <TabsTrigger value='product'>Detalles</TabsTrigger>
                <TabsTrigger value='resources'>Recursos</TabsTrigger>
                <TabsTrigger value='schedule'>Horario</TabsTrigger>
                <TabsTrigger value='photos'>Fotos</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value='general' className='space-y-4 pt-4'>
                <ScrollArea className='h-[400px] pr-4'>
                  <div className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor='name'>
                            Nombre del Servicio
                          </FormLabel>
                          <FormControl>
                            <Input
                              id='name'
                              placeholder='Ej: Mantenimiento de equipo'
                              {...field}
                              aria-required='true'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor='description'>
                            Descripción
                          </FormLabel>
                          <FormControl>
                            <Input
                              id='description'
                              placeholder='Descripción del servicio'
                              {...field}
                              aria-required='true'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='durationValue'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='durationValue'>
                              Duración
                            </FormLabel>
                            <FormControl>
                              <Input
                                id='durationValue'
                                type='number'
                                placeholder='Valor de la duración'
                                min={1}
                                {...field}
                                aria-required='true'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='durationUnit'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='durationUnit'>
                              Unidad de Duración
                            </FormLabel>
                            <SelectDropdown
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              items={durationOptions}
                              aria-required='true'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='maxConcurrentBooks'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='maxConcurrentBooks'>
                              Máximo de Reservas Concurrentes
                            </FormLabel>
                            <FormControl>
                              <Input
                                id='maxConcurrentBooks'
                                type='number'
                                placeholder='Número máximo de reservas'
                                min={1}
                                {...field}
                                aria-required='true'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='minBookingLeadHours'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='minBookingLeadHours'>
                              Horas Mínimas de Anticipación
                            </FormLabel>
                            <FormControl>
                              <Input
                                id='minBookingLeadHours'
                                type='number'
                                placeholder='Horas mínimas para reservar'
                                min={0}
                                {...field}
                                aria-required='true'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='codigoBarras'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='codigoBarras'>
                              Código de Barras
                            </FormLabel>
                            <FormControl>
                              <Input
                                id='codigoBarras'
                                type='number'
                                placeholder='Ej: 1234567890123'
                                {...field}
                                value={field.value || ''}
                                onFocus={() => {
                                  if (field.value === 0) {
                                    field.onChange('')
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(
                                    value === '' ? 0 : Number(value)
                                  )
                                }}
                                aria-required='true'
                              />
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
              <TabsContent value='pricing' className='space-y-4 pt-4'>
                <ScrollArea className='h-[400px] pr-4'>
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='priceAmount'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='priceAmount'>Precio</FormLabel>
                            <FormControl>
                              <Input
                                id='priceAmount'
                                type='number'
                                placeholder='0'
                                min={0}
                                step='1'
                                {...field}
                                value={field.value || ''}
                                onFocus={() => {
                                  if (field.value === 0) {
                                    field.onChange(undefined)
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(
                                    value === '' ? undefined : Number(value)
                                  )
                                }}
                                aria-required='true'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='priceCurrency'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor='priceCurrency'>
                              Moneda
                            </FormLabel>
                            <SelectDropdown
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              items={currencyOptions}
                              aria-required='true'
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
              <TabsContent value='product' className='space-y-4 pt-4'>
                <ScrollArea className='h-[400px] pr-4'>
                  <ProductInfoStep type='service' />
                </ScrollArea>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value='resources' className='space-y-4 pt-4'>
                <ScrollArea className='h-[400px] pr-4'>
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-lg font-medium mb-4 flex items-center'>
                        <Wrench className='h-5 w-5 mr-2' />
                        Equipos Requeridos
                        {selectedEquipmentIds.length > 0 && (
                          <Badge variant='secondary' className='ml-2'>
                            {selectedEquipmentIds.length}
                          </Badge>
                        )}
                      </h3>
                      
                      {/* Búsqueda de equipos */}
                      <div className='relative mb-4'>
                        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                          <Search className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <Input
                          type='text'
                          placeholder='Buscar equipo por nombre, categoría o marca...'
                          value={equipmentSearchQuery}
                          onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                          className='pl-10 pr-10'
                        />
                        {equipmentSearchQuery && (
                          <Button
                            type="button"
                            variant='ghost'
                            size='sm'
                            className='absolute inset-y-0 right-0 flex items-center pr-3 h-full'
                            onClick={() => setEquipmentSearchQuery('')}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      {/* Lista de equipos */}
                      {loadingEquipment ? (
                        <div className='flex justify-center py-8'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary'></div>
                        </div>
                      ) : filteredEquipment.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto'>
                          {filteredEquipment.map((eq) => (
                            <Card
                              key={eq.id}
                              className={cn(
                                'cursor-pointer hover:border-primary transition-all',
                                selectedEquipmentIds.includes(eq.id) && 'border-primary bg-primary/5'
                              )}
                              onClick={() => toggleEquipmentSelection(eq.id)}
                            >
                              <CardContent className='p-3'>
                                <div className='flex items-center justify-between'>
                                  <div className='flex-1'>
                                    <div className='flex items-center gap-2'>
                                      <Wrench className='h-4 w-4 text-muted-foreground' />
                                      <p className='text-sm font-medium'>{eq.name}</p>
                                    </div>
                                    {eq.category && (
                                      <p className='text-xs text-muted-foreground mt-1'>
                                        {eq.category}
                                      </p>
                                    )}
                                    {eq.brand && (
                                      <p className='text-xs text-muted-foreground'>
                                        {eq.brand}
                                      </p>
                                    )}
                                  </div>
                                  {selectedEquipmentIds.includes(eq.id) && (
                                    <CheckCircle className='h-5 w-5 text-primary flex-shrink-0' />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-muted-foreground'>
                          <Wrench className='h-8 w-8 mx-auto mb-2' />
                          <p>{equipmentSearchQuery ? 'No se encontraron equipos' : 'No hay equipos disponibles'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className='text-lg font-medium mb-4 flex items-center'>
                        <Package className='h-5 w-5 mr-2' />
                        Consumibles Requeridos
                        {consumableUsages.length > 0 && (
                          <Badge variant='secondary' className='ml-2'>
                            {consumableUsages.reduce((total, usage) => total + usage.quantity, 0)}
                          </Badge>
                        )}
                      </h3>
                      
                      {/* Búsqueda de consumibles */}
                      <div className='relative mb-4'>
                        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                          <Search className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <Input
                          type='text'
                          placeholder='Buscar consumible por nombre, categoría o marca...'
                          value={consumablesSearchQuery}
                          onChange={(e) => setConsumablesSearchQuery(e.target.value)}
                          className='pl-10 pr-10'
                        />
                        {consumablesSearchQuery && (
                          <Button
                            type="button"
                            variant='ghost'
                            size='sm'
                            className='absolute inset-y-0 right-0 flex items-center pr-3 h-full'
                            onClick={() => setConsumablesSearchQuery('')}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      {/* Lista de consumibles */}
                      {loadingConsumables ? (
                        <div className='flex justify-center py-8'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary'></div>
                        </div>
                      ) : filteredConsumables.length > 0 ? (
                        <div className='space-y-3 max-h-48 overflow-y-auto'>
                          {filteredConsumables.map((consumable) => {
                            const currentUsage = getConsumableUsage(consumable.id)
                            const canIncrement = currentUsage < consumable.stock
                            const canDecrement = currentUsage > 0

                            return (
                              <Card key={consumable.id} className={cn(
                                'transition-all',
                                currentUsage > 0 && 'border-primary bg-primary/5'
                              )}>
                                <CardContent className='p-3'>
                                  <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                      <div className='flex items-center gap-2'>
                                        <Package className='h-4 w-4 text-muted-foreground' />
                                        <p className='text-sm font-medium'>{consumable.name}</p>
                                      </div>
                                      <div className='flex items-center gap-4 mt-1'>
                                        {consumable.category && (
                                          <p className='text-xs text-muted-foreground'>
                                            {consumable.category}
                                          </p>
                                        )}
                                        <div className='flex items-center gap-1'>
                                          <p className='text-xs text-muted-foreground'>
                                            Stock: {consumable.stock}
                                          </p>
                                          {consumable.stock === 0 && (
                                            <AlertCircle className='h-3 w-3 text-red-500' />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                      <Button
                                        type="button"
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 p-0'
                                        onClick={() => decrementConsumable(consumable)}
                                        disabled={!canDecrement}
                                      >
                                        <Minus className='h-4 w-4' />
                                      </Button>
                                      <span className='text-sm font-medium w-8 text-center'>
                                        {currentUsage}
                                      </span>
                                      <Button
                                        type="button"
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 p-0'
                                        onClick={() => incrementConsumable(consumable)}
                                        disabled={!canIncrement || consumable.stock === 0}
                                      >
                                        <Plus className='h-4 w-4' />
                                      </Button>
                                    </div>
                                  </div>
                                  {consumable.stock === 0 && (
                                    <div className='mt-2 p-2 bg-red-50 rounded-md border border-red-200'>
                                      <p className='text-xs text-red-600'>
                                        Sin stock disponible
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-muted-foreground'>
                          <Package className='h-8 w-8 mx-auto mb-2' />
                          <p>{consumablesSearchQuery ? 'No se encontraron consumibles' : 'No hay consumibles disponibles'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value='schedule'>
                <ScrollArea className='h-[400px] pr-4'>
                  <div className='space-y-4'>
                    {isLoadingSchedule ? (
                      <div className='flex items-center justify-center py-8'>
                        <div className='flex items-center gap-3'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary'></div>
                          <span className='text-sm text-muted-foreground'>
                            Cargando horario predeterminado...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <ScheduleSection form={form} />
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value='photos' className='space-y-4 pt-4'>
                <ScrollArea className='h-[400px] pr-4'>
                  <div className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='photos'
                      render={() => (
                        <FormItem>
                          <FormLabel>Fotos del Servicio</FormLabel>
                          <FormControl>
                            <div className='mb-2'>
                              <FileUpload
                                maxFiles={5}
                                maxSize={100 * 1024 * 1024}
                                value={photos}
                                onChange={setPhotos}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DialogFooter className='mt-6 gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting || isUploading}
                aria-label='Cancelar'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || isUploading}
                aria-label={isEdit ? 'Actualizar servicio' : 'Crear servicio'}
                className='min-w-24'
              >
                {isSubmitting || isUploading
                  ? 'Guardando...'
                  : isEdit
                    ? 'Actualizar'
                    : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

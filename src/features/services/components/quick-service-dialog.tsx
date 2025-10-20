import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getDefaultProductInfo } from '@/types'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
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
import { ScheduleSection } from '../../employees/components/form/schedule-section'
import { ScheduleService } from '@/features/settings/profile/ProfileService.ts'
import {
  getDefaultQuickService,
  QuickServiceFormValues,
  quickServiceSchema,
} from '../types-quick'
import { ServiceFormData, useCreateService } from './service-mutations'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickServiceDialog({ open, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userScheduleQuery = useQuery({
    queryKey: ['user-schedule'],
    queryFn: async () => {
      return await ScheduleService.getSchedule()
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  })

  // Default values for quick service
  const defaultValues = useMemo(() => getDefaultQuickService(), [])

  const form = useForm<QuickServiceFormValues>({
    resolver: zodResolver(quickServiceSchema),
    defaultValues,
  })

  const { reset } = form

  // Reset form when dialog closes
  const handleOpenChange = useCallback(
    (state: boolean) => {
      if (!state) {
        reset()
      }
      onOpenChange(state)
    },
    [reset, onOpenChange]
  )

  // Reset form when modal is opened
  React.useEffect(() => {
    if (open) {
      const values = {
        ...defaultValues,
        schedule: userScheduleQuery.data?.weeklyWorkDays || defaultValues.schedule
      }
      reset(values)
    }
  }, [open, reset, defaultValues, userScheduleQuery.data?.weeklyWorkDays])

  // Handler for form submission success
  const handleSuccess = useCallback(() => {
    reset()
    handleOpenChange(false)
    setIsSubmitting(false)
  }, [reset, handleOpenChange])

  // Create service mutation
  const createService = useCreateService({
    onSuccess: handleSuccess,
  })

  const onSubmit = async (values: QuickServiceFormValues) => {
    setIsSubmitting(true)

    // Convertir los datos del servicio rápido al formato completo
    const completeServiceData: ServiceFormData = {
      ...values,
      // Campos obligatorios para el backend pero con valores por defecto
      maxConcurrentBooks: 1,
      minBookingLeadHours: 0,
      productInfo: {
        ...getDefaultProductInfo(),
        sku: `QUICK-${Date.now()}`, // SKU automático para servicios rápidos
        categoryIds: [],
        subcategoryIds: [],
        tagIds: [],
        notes: '',
      },
      codigoBarras: Date.now(), // Código de barras automático
      photos: [],
      // Campos de equipos y consumibles (vacíos para servicios rápidos)
      equipmentIds: [],
      consumableUsages: [],
    }

    createService.mutate(completeServiceData)
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              toast.error('Completa todos los campos por favor')
            })}
          >
            <DialogHeader>
              <DialogTitle>Crear Servicio Rápido</DialogTitle>
              <DialogDescription>
                Crea un nuevo servicio con configuración básica. Los campos
                avanzados se configurarán automáticamente.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className='h-[500px] pr-4 mt-4'>
              <div className='space-y-6 px-2'>
                {/* Información básica */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Información Básica</h3>

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
                            placeholder='Ej: Consulta médica'
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
                        <FormLabel htmlFor='description'>Descripción</FormLabel>
                        <FormControl>
                          <Input
                            id='description'
                            placeholder='Descripción breve del servicio'
                            {...field}
                            aria-required='true'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Duración */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Duración</h3>

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
                              placeholder='30'
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
                          <FormLabel htmlFor='durationUnit'>Unidad</FormLabel>
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
                </div>

                {/* Precio */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Precio</h3>

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
                              onFocus={(e) => {
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
                          <FormLabel htmlFor='priceCurrency'>Moneda</FormLabel>
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

                {/* Horario */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Horario de Disponibilidad
                  </h3>
                  <div className='px-2'>
                    <ScheduleSection form={form} />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className='mt-6 gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                aria-label='Cancelar'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                aria-label='Crear servicio rápido'
                className='min-w-24'
              >
                {isSubmitting ? 'Creando...' : 'Crear Servicio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useCallback, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { quickEventSchema, getDefaultQuickEvent, QuickEventFormValues } from './types-quick'
import { Currency, RecurrenceFrequency } from './types'
import { useEventMutations } from './hooks/useEventMutations'
import { getDefaultProductInfo } from '@/types'
import { toast } from 'sonner'
import * as React from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickEventDialog({
  open,
  onOpenChange,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createEvent } = useEventMutations()

  // Default values for quick event
  const defaultValues = useMemo(() => getDefaultQuickEvent(), [])

  const form = useForm<QuickEventFormValues>({
    resolver: zodResolver(quickEventSchema),
    defaultValues,
  })

  const { reset, watch } = form

  // Watch for limited capacity to show/hide max capacity field
  const isLimitedCapacity = watch('isLimitedCapacity')

  // Reset form when dialog closes
  const handleOpenChange = useCallback((state: boolean) => {
    if (!state) {
      reset()
    }
    onOpenChange(state)
  }, [reset, onOpenChange])

  // Reset form when modal is opened
  React.useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset, defaultValues])

  // Handler for form submission success
  const handleSuccess = useCallback(() => {
    reset()
    handleOpenChange(false)
    setIsSubmitting(false)
  }, [reset, handleOpenChange])

  const onSubmit = async (values: QuickEventFormValues) => {
    setIsSubmitting(true)

    try {
      // Convertir los datos del evento rápido al formato completo
      const completeEventData = {
        name: values.name,
        description: values.description,
        location: values.location,
        price: {
          amount: values.priceAmount,
          currency: values.priceCurrency,
        },
        capacity: {
          isLimited: values.isLimitedCapacity,
          maxCapacity: values.isLimitedCapacity ? values.maxCapacity : null,
        },
        duration: {
          startAt: values.startAt,
          endAt: values.endAt,
        },
        // Campos con valores por defecto para eventos rápidos
        recurrence: {
          frequency: RecurrenceFrequency.NEVER,
          endCondition: null,
        },
        photos: [],
        productInfo: {
          ...getDefaultProductInfo(),
          sku: `QUICK-EVENT-${Date.now()}`, // SKU automático para eventos rápidos
          categoryIds: [],
          subcategoryIds: [],
          tagIds: [],
          notes: '',
        },
      }

      createEvent(completeEventData)
      handleSuccess()
    } catch (error) {
      console.error('Error creating quick event:', error)
      toast.error('Error al crear el evento')
      setIsSubmitting(false)
    }
  }

  // Currency options
  const currencyOptions = useMemo(() => [
    { label: 'MXN', value: Currency.MXN },
    { label: 'USD', value: Currency.USD },
    { label: 'EUR', value: Currency.EUR },
  ], [])

  // Handle capacity value changes
  React.useEffect(() => {
    if (!isLimitedCapacity) {
      form.setValue('maxCapacity', null)
    }
  }, [isLimitedCapacity, form])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            toast.error('Completa todos los campos por favor')
          })}>
            <DialogHeader>
              <DialogTitle>Crear Evento Rápido</DialogTitle>
              <DialogDescription>
                Crea un nuevo evento con configuración básica. Los campos avanzados se configurarán automáticamente.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[500px] pr-4 mt-4">
              <div className="space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información Básica</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Nombre del Evento</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="Ej: Clase de Yoga"
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
                          <Textarea
                            id="description"
                            placeholder="Describe tu evento..."
                            rows={3}
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="location">Ubicación</FormLabel>
                        <FormControl>
                          <Textarea
                            id="location"
                            placeholder="Virtual o dirección física"
                            rows={2}
                            {...field}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Capacidad */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Capacidad</h3>
                  
                  <FormField
                    control={form.control}
                    name="isLimitedCapacity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Capacidad Limitada</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Establece un límite máximo de participantes
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {isLimitedCapacity && (
                    <FormField
                      control={form.control}
                      name="maxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="maxCapacity">Capacidad Máxima</FormLabel>
                          <FormControl>
                            <Input
                              id="maxCapacity"
                              type="number"
                              min="1"
                              placeholder="Número de participantes"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              aria-required="true"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Fechas y horarios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fecha y Hora</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="startAt">Fecha y Hora de Inicio</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              htmlId="startAt"
                              defaultValue={field.value ? new Date(field.value) : undefined}
                              aria-label="Fecha y hora de inicio"
                              onChange={(date: Date) => {
                                field.onChange(date.toISOString());
                                // Auto-set end date 1 hour later if not set or if end is before start
                                const endTime = new Date(form.getValues('endAt'));
                                if (!form.getValues('endAt') || endTime <= date) {
                                  const newEndTime = new Date(date);
                                  newEndTime.setHours(newEndTime.getHours() + 1);
                                  form.setValue('endAt', newEndTime.toISOString());
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="endAt">Fecha y Hora de Fin</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              htmlId="endAt"
                              defaultValue={field.value ? new Date(field.value) : undefined}
                              aria-label="Fecha y hora de fin"
                              onChange={(date: Date) => field.onChange(date.toISOString())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Precio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Precio</h3>
                  
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
                              min="0"
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
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar moneda" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencyOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
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
              </div>
            </ScrollArea>

            <DialogFooter className="mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                aria-label="Cancelar"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-label="Crear evento rápido"
                className="min-w-24"
              >
                {isSubmitting ? 'Creando...' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

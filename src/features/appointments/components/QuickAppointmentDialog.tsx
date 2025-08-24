import React, { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { es } from 'date-fns/locale/es'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { appointmentService } from '../appointmentService'
import { useDialogState } from '../contexts/DialogStateContext'
import { useGetServices } from '../hooks/useGetServices'
import {
  getDefaultQuickAppointment,
  minutesToTime,
  QuickAppointmentFormValues,
  quickAppointmentSchema,
  timeToMinutes,
} from '../types-quick'
import { CreateOrSelectClient } from './CreateOrSelectClient'
import { CreateOrSelectMultipleServices } from './CreateOrSelectMultipleServices'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (appointmentId?: string) => void
  initialClientId?: string
  onClientChange?: (clientId: string) => void
  initialServiceId?: string
  defaultDate?: Date
  defaultStartTime?: number
  defaultEndTime?: number
}

export function QuickAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
  initialClientId,
  onClientChange,
  initialServiceId,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasPreSelectedTime =
    defaultStartTime !== undefined && defaultEndTime !== undefined
  const [userModifiedTime, setUserModifiedTime] = useState(false)
  const { data: services = [], isLoading: servicesLoading } = useGetServices()
  const { openDialog, closeDialog } = useDialogState()

  // Default values for quick appointment
  const defaultValues = useMemo(() => {
    const hasValidTimeRange =
      defaultStartTime !== undefined && defaultEndTime !== undefined
    const baseDefaults = getDefaultQuickAppointment()

    // Use provided time range if available, otherwise fall back to base defaults
    const finalStartTime = hasValidTimeRange
      ? defaultStartTime!
      : baseDefaults.startAt!
    const finalEndTime = hasValidTimeRange
      ? defaultEndTime!
      : baseDefaults.endAt!

    return {
      ...baseDefaults,
      clientId: initialClientId || '',
      serviceIds: initialServiceId ? [initialServiceId] : [],
      date: defaultDate || new Date(),
      startAt: finalStartTime,
      endAt: finalEndTime,
    }
  }, [
    initialClientId,
    initialServiceId,
    defaultDate,
    defaultStartTime,
    defaultEndTime,
  ])

  const form = useForm<QuickAppointmentFormValues>({
    resolver: zodResolver(quickAppointmentSchema),
    defaultValues,
  })

  const { reset, watch } = form
  const selectedServiceIds = useMemo(() => watch('serviceIds') || [], [watch])

  // Reset form when dialog closes
  const handleOpenChange = useCallback(
    (state: boolean) => {
      if (state) {
        openDialog()
        // Don't reset here, let useEffect handle it with proper values
      } else {
        closeDialog()
        reset() // Reset to clean state when closing
      }
      onOpenChange(state)
    },
    [reset, onOpenChange, openDialog, closeDialog]
  )

  React.useEffect(() => {
    if (open) {
      openDialog()

      // Create fresh form values to ensure proper time range handling
      const formValues = {
        ...getDefaultQuickAppointment(),
        clientId: initialClientId || '',
        serviceIds: initialServiceId ? [initialServiceId] : [],
        date: defaultDate || new Date(),
        // Robust time value handling with validation
        startAt:
          typeof defaultStartTime === 'number' &&
          !isNaN(defaultStartTime) &&
          defaultStartTime >= 0
            ? defaultStartTime
            : getDefaultQuickAppointment().startAt!,
        endAt:
          typeof defaultEndTime === 'number' &&
          !isNaN(defaultEndTime) &&
          defaultEndTime >= 0
            ? defaultEndTime
            : getDefaultQuickAppointment().endAt!,
      }

      reset(formValues)
      setUserModifiedTime(false)
    } else {
      closeDialog()
    }
  }, [
    open,
    reset,
    initialClientId,
    initialServiceId,
    defaultDate,
    defaultStartTime,
    defaultEndTime,
    openDialog,
    closeDialog,
  ])

  const handleSuccess = useCallback(async () => {
    reset()
    handleOpenChange(false)
    setIsSubmitting(false)
  }, [reset, handleOpenChange])

  const onSubmit = async (values: QuickAppointmentFormValues) => {
    setIsSubmitting(true)

    try {
      // Convertir los datos de la cita rápida al formato completo
      const appointmentData = {
        clientId: values.clientId,
        serviceIds: values.serviceIds,
        employeeIds: [], // Sin empleados específicos para citas rápidas
        date: values.date.toISOString(),
        timeRange: {
          startAt: values.startAt,
          endAt: values.endAt,
        },
        notes: '', // Sin notas para citas rápidas
        // Campos con valores por defecto
        status: 'pendiente' as const,
        paymentStatus: 'pendiente' as const,
        deposit: null,
      }

      const result = await appointmentService.makeAppointment(appointmentData)
      toast.success('Cita creada exitosamente')

      if (onClientChange && values.clientId !== initialClientId) {
        onClientChange(values.clientId)
      }

      await handleSuccess()
      onSuccess?.(result.id)
    } catch (error) {
      console.error('Error creating quick appointment:', error)
      toast.error('Error al crear la cita')
      setIsSubmitting(false)
    }
  }

  // Calculate total duration from selected services
  const totalDuration = useMemo(() => {
    if (!selectedServiceIds.length || !services.length) return 60 // Default 1 hour

    return selectedServiceIds.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      if (service) {
        const minutes =
          service.duration.unit === 'hours'
            ? service.duration.value * 60
            : service.duration.value
        return total + minutes
      }
      return total
    }, 0)
  }, [selectedServiceIds, services])

  // Auto-update end time when start time or services change (only if user hasn't manually set a time range)
  React.useEffect(() => {
    const startAt = form.getValues('startAt')
    // Only auto-update if we don't have a pre-selected time range AND user hasn't manually modified time
    if (startAt !== undefined && !userModifiedTime) {
      form.setValue('endAt', startAt + totalDuration)
    }
  }, [
    totalDuration,
    form.setValue,
    form.getValues,
    hasPreSelectedTime,
    userModifiedTime,
  ])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90wh]'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, () => {
              toast.error('Completa todos los campos por favor')
            })}
          >
            <DialogHeader>
              <DialogTitle>Crear Cita Rápida</DialogTitle>
              <DialogDescription>
                Crea una nueva cita con configuración básica. Los campos
                avanzados se configurarán automáticamente.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className=''>
              <div className='space-y-6 p-1'>
                {/* Cliente */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Cliente</h3>

                  <FormField
                    control={form.control}
                    name='clientId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seleccionar Cliente</FormLabel>
                        <FormControl>
                          <CreateOrSelectClient
                            value={field.value}
                            onChange={(clientId) => {
                              field.onChange(clientId)
                              // Notificar cambio de cliente
                              if (onClientChange) {
                                onClientChange(clientId)
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Servicios */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Servicios</h3>

                  <FormField
                    control={form.control}
                    name='serviceIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seleccionar Servicios</FormLabel>
                        <FormControl>
                          <CreateOrSelectMultipleServices
                            selectedIds={field.value || []}
                            onChange={(ids) => {
                              field.onChange(ids)
                            }}
                            onToggle={(id) => {
                              const currentServices = field.value || []
                              const updatedServices = currentServices.includes(
                                id
                              )
                                ? currentServices.filter(
                                    (serviceId: string) => serviceId !== id
                                  )
                                : [...currentServices, id]

                              field.onChange(updatedServices)
                            }}
                            maxHeight='200px'
                            placeholder='Buscar o crear servicio...'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fecha */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Fecha</h3>

                  <FormField
                    control={form.control}
                    name='date'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Fecha de la Cita</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Horarios */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Horario</h3>

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='startAt'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor='startAt'>
                            Hora de Inicio
                          </FormLabel>
                          <FormControl>
                            <Input
                              id='startAt'
                              type='time'
                              value={minutesToTime(field.value || 0)}
                              onChange={(e) => {
                                const minutes = timeToMinutes(e.target.value)
                                field.onChange(minutes)
                                setUserModifiedTime(true)

                                // Auto-update end time logic:
                                // Only auto-update if we don't have a pre-selected time range
                                // When user has manually selected a time range, preserve it
                                if (!hasPreSelectedTime) {
                                  form.setValue(
                                    'endAt',
                                    minutes + totalDuration
                                  )
                                }
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
                      name='endAt'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor='endAt'>Hora de Fin</FormLabel>
                          <FormControl>
                            <Input
                              id='endAt'
                              type='time'
                              value={minutesToTime(field.value || 0)}
                              onChange={(e) => {
                                const minutes = timeToMinutes(e.target.value)
                                field.onChange(minutes)
                              }}
                              aria-required='true'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {totalDuration > 0 && (
                    <p className='text-sm text-muted-foreground'>
                      Duración total estimada: {Math.floor(totalDuration / 60)}h{' '}
                      {totalDuration % 60}min
                    </p>
                  )}
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
                disabled={isSubmitting || servicesLoading}
                aria-label='Crear cita rápida'
                className='min-w-24'
              >
                {isSubmitting ? 'Creando...' : 'Crear Cita'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

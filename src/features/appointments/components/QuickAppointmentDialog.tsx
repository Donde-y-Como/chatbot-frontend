import React, { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CreateOrSelectClient } from './CreateOrSelectClient'
import { useGetServices } from '../hooks/useGetServices'
import { useDialogState } from '../contexts/DialogStateContext'
import { appointmentService } from '../appointmentService'
import { quickAppointmentSchema, getDefaultQuickAppointment, QuickAppointmentFormValues, minutesToTime, timeToMinutes } from '../types-quick'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (appointmentId?: string) => void
  initialClientId?: string
  onClientChange?: (clientId: string) => void
  initialServiceId?: string 
}

export function QuickAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
  initialClientId,
  onClientChange,
  initialServiceId,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: services = [], isLoading: servicesLoading } = useGetServices()
  const { openDialog, closeDialog } = useDialogState()

  // Default values for quick appointment
  const defaultValues = useMemo(() => ({
    ...getDefaultQuickAppointment(),
    clientId: initialClientId || '',
    serviceIds: initialServiceId ? [initialServiceId] : [] 
  }), [initialClientId, initialServiceId])

  const form = useForm<QuickAppointmentFormValues>({
    resolver: zodResolver(quickAppointmentSchema),
    defaultValues,
  })

  const { reset, watch } = form
  const selectedServiceIds = watch('serviceIds') || []

  // Reset form when dialog closes
  const handleOpenChange = useCallback((state: boolean) => {
    if (state) {
      openDialog()
    } else {
      closeDialog()
      reset()
    }
    onOpenChange(state)
  }, [reset, onOpenChange, openDialog, closeDialog])

  React.useEffect(() => {
    if (open) {
      openDialog()
      reset({
        ...defaultValues,
        clientId: initialClientId || '',
        serviceIds: initialServiceId ? [initialServiceId] : []
      })
    } else {
      closeDialog()
    }
  }, [open, reset, defaultValues, initialClientId, initialServiceId, openDialog, closeDialog])

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

  // Service selection handlers
  const handleServiceToggle = (serviceId: string) => {
    const currentServices = form.getValues('serviceIds') || []
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId]
    
    form.setValue('serviceIds', updatedServices)
  }

  const handleRemoveService = (serviceId: string) => {
    const currentServices = form.getValues('serviceIds') || []
    const updatedServices = currentServices.filter(id => id !== serviceId)
    form.setValue('serviceIds', updatedServices)
  }

  // Calculate total duration from selected services
  const totalDuration = useMemo(() => {
    if (!selectedServiceIds.length || !services.length) return 60 // Default 1 hour

    return selectedServiceIds.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      if (service) {
        const minutes = service.duration.unit === 'hours' 
          ? service.duration.value * 60 
          : service.duration.value
        return total + minutes
      }
      return total
    }, 0)
  }, [selectedServiceIds, services])

  // Auto-update end time when start time or services change
  React.useEffect(() => {
    const startAt = form.getValues('startAt')
    if (startAt !== undefined) {
      form.setValue('endAt', startAt + totalDuration)
    }
  }, [totalDuration, form])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            toast.error('Completa todos los campos por favor')
          })}>
            <DialogHeader>
              <DialogTitle>Crear Cita Rápida</DialogTitle>
              <DialogDescription>
                Crea una nueva cita con configuración básica. Los campos avanzados se configurarán automáticamente.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[500px] pr-4 mt-4">
              <div className="space-y-6">
                {/* Cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cliente</h3>
                  
                  <FormField
                    control={form.control}
                    name="clientId"
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
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Servicios</h3>
                  
                  <FormField
                    control={form.control}
                    name="serviceIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Seleccionar Servicios</FormLabel>
                        <div className="space-y-3">
                          {/* Selected services */}
                          {selectedServiceIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedServiceIds.map((serviceId) => {
                                const service = services.find(s => s.id === serviceId)
                                return service ? (
                                  <Badge 
                                    key={serviceId} 
                                    variant="secondary" 
                                    className="flex items-center gap-1"
                                  >
                                    {service.name}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveService(serviceId)}
                                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          )}
                          
                          {/* Service selection */}
                          <Select
                            value=""
                            onValueChange={handleServiceToggle}
                            disabled={servicesLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Agregar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                              {services
                                .filter(service => !selectedServiceIds.includes(service.id))
                                .map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.name} - {service.duration.value} {service.duration.unit === 'hours' ? 'hrs' : 'min'}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fecha */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fecha</h3>
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de la Cita</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
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
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Horario</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="startAt">Hora de Inicio</FormLabel>
                          <FormControl>
                            <Input
                              id="startAt"
                              type="time"
                              value={minutesToTime(field.value || 0)}
                              onChange={(e) => {
                                const minutes = timeToMinutes(e.target.value)
                                field.onChange(minutes)
                                // Auto-update end time
                                form.setValue('endAt', minutes + totalDuration)
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
                      name="endAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="endAt">Hora de Fin</FormLabel>
                          <FormControl>
                            <Input
                              id="endAt"
                              type="time"
                              value={minutesToTime(field.value || 0)}
                              onChange={(e) => {
                                const minutes = timeToMinutes(e.target.value)
                                field.onChange(minutes)
                              }}
                              aria-required="true"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {totalDuration > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Duración total estimada: {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                    </p>
                  )}
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
                disabled={isSubmitting || servicesLoading}
                aria-label="Crear cita rápida"
                className="min-w-24"
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

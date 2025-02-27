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
import { Service } from '../../appointments/types'

// Form validation schema
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
  const isEdit = !!currentService

  // Create memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => {
    return isEdit
      ? {
        ...currentService,
        durationValue: currentService.duration.value,
        durationUnit: currentService.duration.unit,
        priceAmount: currentService.price.amount,
        priceCurrency: currentService.price.currency,
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
    }
    onOpenChange(state)
  }, [form, onOpenChange])

  // Handler for form submission success
  const handleSuccess = useCallback(() => {
    form.reset()
    handleOpenChange(false)
    setIsSubmitting(false)
  }, [form, handleOpenChange])

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

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
        <DialogHeader className="text-left">
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

        {/* Scrollable form area with accessibility improvements */}
        <ScrollArea className="h-[26.25rem] md:h-[28rem] w-full pr-4 -mr-4 py-1">
          <Form {...form}>
            <form
              id="service-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
              aria-label="Formulario de servicio"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Nombre del Servicio</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Nombre del servicio"
                          {...field}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
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

                {/* Duration Value */}
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

                {/* Duration Unit */}
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

                {/* Price Amount */}
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
                          placeholder="Cantidad"
                          min={0}
                          step="0.01"
                          {...field}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Currency */}
                <FormField
                  control={form.control}
                  name="priceCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="priceCurrency">Moneda</FormLabel>
                      <FormControl>
                        <Input
                          id="priceCurrency"
                          placeholder="Moneda (ej. MXN)"
                          {...field}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Concurrent Books */}
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

                {/* Min Booking Lead Hours */}
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
            </form>
          </Form>
        </ScrollArea>

        {/* Dialog Footer with Buttons */}
        <DialogFooter className="sm:justify-between">
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
            form="service-form"
            disabled={isSubmitting}
            aria-label={isEdit ? "Actualizar servicio" : "Crear servicio"}
            className="min-w-24"
          >
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
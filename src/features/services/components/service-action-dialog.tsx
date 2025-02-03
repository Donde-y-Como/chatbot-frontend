'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
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
  const isEdit = !!currentService
  const form = useForm<ServiceForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
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
          durationUnit: 'minutes',
          priceAmount: 0,
          priceCurrency: 'USD',
          maxConcurrentBooks: 1,
          minBookingLeadHours: 0,
        },
  })

  const queryClient = useQueryClient()

  const serviceMutation = useMutation({
    mutationKey: ['services-form'],
    mutationFn: async (values: ServiceForm) => {
      console.log('Saving service', values)
      const body = {
        ...values,
        price: { amount: values.priceAmount, currency: values.priceCurrency },
        duration: { unit: values.durationUnit, value: values.durationValue },
      }

      if(isEdit && currentService) {
        const res = await api.put('/services/'+ currentService.id, body)
        if (res.status != 201) throw new Error('Error al editar servicio')
        return
      }

      const res = await api.post('/services', body)
      if (res.status != 201) throw new Error('Error al guardar servicio')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['services']
      })
      toast.success('Servicio guardado con éxito')
    },
    onError: () => {
      toast.error('Error al guardar servicio')
    },
  })

  const onSubmit = async (values: ServiceForm) => {
    serviceMutation.mutate(values)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>
            {isEdit ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza el servicio aquí.'
              : 'Crea un nuevo servicio aquí.'}{' '}
            Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='h-[26.25rem] w-full pr-4 -mr-4 py-1'>
          <Form {...form}>
            <form
              id='service-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Servicio</FormLabel>
                    <FormControl>
                      <Input placeholder='Nombre del servicio' {...field} />
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
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Descripción del servicio'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='durationValue'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Valor de la duración'
                        {...field}
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
                    <FormLabel>Unidad de Duración</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      items={[
                        { label: 'Minutos', value: 'minutes' },
                        { label: 'Horas', value: 'hours' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='priceAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='Cantidad' {...field} />
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
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Input placeholder='Moneda (ej. USD)' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='maxConcurrentBooks'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Reservas Concurrentes</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Número máximo de reservas'
                        {...field}
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
                    <FormLabel>Horas Mínimas de Anticipación</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Horas mínimas para reservar'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button type='submit' form='service-form'>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

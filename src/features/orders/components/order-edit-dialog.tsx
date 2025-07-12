import { useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { OrderWithDetails } from '@/features/store/types'
import { useEditOrder } from '../hooks'
import { EditOrderFormData, EditOrderRequestSchema } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: OrderWithDetails
}

const statusOptions = [
  {
    value: 'pending',
    label: 'Pendiente',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'partial_paid',
    label: 'Parcialmente Pagado',
    color: 'bg-blue-100 text-blue-800',
  },
  { value: 'paid', label: 'Pagado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
]

const itemTypeOptions = [
  { value: 'product', label: 'Producto' },
  { value: 'service', label: 'Servicio' },
  { value: 'event', label: 'Evento' },
  { value: 'bundle', label: 'Paquete' },
]

export function OrderEditDialog({ open, onOpenChange, currentRow }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const editOrderMutation = useEditOrder()

  const form = useForm<EditOrderFormData>({
    resolver: zodResolver(EditOrderRequestSchema),
    defaultValues: {
      orderId: currentRow.id,
      status: currentRow.status,
      notes: currentRow.notes || '',
      items: currentRow.items.map((item) => ({
        ...item,
        eventMetadata: item.eventMetadata
          ? {
              selectedDate: item.eventMetadata.selectedDate,
              provisionalBookingId: item.eventMetadata.provisionalBookingId,
            }
          : undefined,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })



  const addNewItem = () => {
    append({
      itemId: '',
      itemType: 'product',
      name: '',
      quantity: 1,
      unitPrice: { amount: 0, currency: 'MXN' },
      finalPrice: { amount: 0, currency: 'MXN' },
      notes: '',
    })
  }

  const handleSubmit = async (data: EditOrderFormData) => {
    setIsLoading(true)
    try {
      await editOrderMutation.mutateAsync({
        orderId: data.orderId,
        items: data.items,
        status: data.status,
        notes: data.notes,
      })

      toast.success(
        `La orden #${currentRow.id.slice(-8).toUpperCase()} ha sido actualizada correctamente.`
      )
      onOpenChange(false)
    } catch (error) {
      console.error('Edit error:', error)
      toast.error(
        `Hubo un error al actualizar la orden #${currentRow.id.slice(-8).toUpperCase()}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const watchedStatus = form.watch('status')
  const currentStatus = useMemo(
    () => statusOptions.find((s) => s.value === watchedStatus),
    [watchedStatus]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconEdit className='h-5 w-5 text-blue-600' />
            Editar Orden #{currentRow.id.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de la orden, incluyendo items, estado y notas.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col flex-1'
        >
          <ScrollArea className='flex-1 pr-4'>
            <div className='space-y-6'>
              {/* Order Status */}
              <div className='space-y-2'>
                <Label htmlFor='status'>Estado de la Orden</Label>
                <Controller
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue>
                          {currentStatus && (
                            <Badge className={currentStatus.color}>
                              {currentStatus.label}
                            </Badge>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && (
                  <p className='text-sm text-red-600'>
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>

              {/* Order Notes */}
              <div className='space-y-2'>
                <Label htmlFor='notes'>Notas de la Orden</Label>
                <Textarea
                  {...form.register('notes')}
                  placeholder='Notas adicionales para la orden...'
                  rows={3}
                />
                {form.formState.errors.notes && (
                  <p className='text-sm text-red-600'>
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Order Items */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label className='text-base font-semibold'>
                    Items de la Orden
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addNewItem}
                    className='flex items-center gap-2'
                  >
                    <IconPlus className='h-4 w-4' />
                    Agregar Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='border rounded-lg p-4 space-y-4'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Item #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => remove(index)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {/* Item ID */}
                      <div className='space-y-2'>
                        <Label>ID del Item</Label>
                        <Input
                          {...form.register(`items.${index}.itemId`)}
                          placeholder='ID del item'
                        />
                        {form.formState.errors.items?.[index]?.itemId && (
                          <p className='text-sm text-red-600'>
                            {
                              form.formState.errors.items[index]?.itemId
                                ?.message
                            }
                          </p>
                        )}
                      </div>

                      {/* Item Type */}
                      <div className='space-y-2'>
                        <Label>Tipo de Item</Label>
                        <Controller
                          control={form.control}
                          name={`items.${index}.itemType`}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {itemTypeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {form.formState.errors.items?.[index]?.itemType && (
                          <p className='text-sm text-red-600'>
                            {
                              form.formState.errors.items[index]?.itemType
                                ?.message
                            }
                          </p>
                        )}
                      </div>

                      {/* Item Name */}
                      <div className='space-y-2'>
                        <Label>Nombre del Item</Label>
                        <Input
                          {...form.register(`items.${index}.name`)}
                          placeholder='Nombre del item'
                        />
                        {form.formState.errors.items?.[index]?.name && (
                          <p className='text-sm text-red-600'>
                            {form.formState.errors.items[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className='space-y-2'>
                        <Label>Cantidad</Label>
                        <Input
                          type='number'
                          min='1'
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          placeholder='1'
                        />
                        {form.formState.errors.items?.[index]?.quantity && (
                          <p className='text-sm text-red-600'>
                            {
                              form.formState.errors.items[index]?.quantity
                                ?.message
                            }
                          </p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div className='space-y-2'>
                        <Label>Precio Unitario</Label>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          {...form.register(`items.${index}.unitPrice.amount`, {
                            valueAsNumber: true,
                          })}
                          placeholder='0.00'
                        />
                        {form.formState.errors.items?.[index]?.unitPrice
                          ?.amount && (
                          <p className='text-sm text-red-600'>
                            {
                              form.formState.errors.items[index]?.unitPrice
                                ?.amount?.message
                            }
                          </p>
                        )}
                      </div>

                      {/* Final Price */}
                      <div className='space-y-2'>
                        <Label>Precio Final</Label>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          {...form.register(
                            `items.${index}.finalPrice.amount`,
                            { valueAsNumber: true }
                          )}
                          placeholder='0.00'
                        />
                        {form.formState.errors.items?.[index]?.finalPrice
                          ?.amount && (
                          <p className='text-sm text-red-600'>
                            {
                              form.formState.errors.items[index]?.finalPrice
                                ?.amount?.message
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Item Notes */}
                    <div className='space-y-2'>
                      <Label>Notas del Item</Label>
                      <Textarea
                        {...form.register(`items.${index}.notes`)}
                        placeholder='Notas adicionales para este item...'
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className='pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isLoading}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Orden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  ConversationStatus,
  conversationStatusSchema,
  ConversationStatusFormValues,
} from '../types'

interface ConversationStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ConversationStatusFormValues) => Promise<void>
  isSubmitting: boolean
  initialData?: ConversationStatus
  title: string
  submitLabel: string
  mode: 'create' | 'edit'
}

export function ConversationStatusDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitLabel,
  mode,
}: ConversationStatusDialogProps) {
  const form = useForm<ConversationStatusFormValues>({
    resolver: zodResolver(conversationStatusSchema),
    defaultValues: {
      name: '',
      orderNumber: 1,
      color: '#3b82f6',
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        name: initialData.name,
        orderNumber: initialData.orderNumber,
        color: initialData.color || '#3b82f6',
      })
    } else {
      form.reset({
        name: '',
        orderNumber: 1,
        color: '#3b82f6',
      })
    }
  }, [initialData, mode, form.reset])

  const handleSubmit = async (values: ConversationStatusFormValues) => {
    try {
      await onSubmit(values)
      form.reset()
      onClose()
    } catch (error) {
      // Errors are handled in hooks
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const getDialogDescription = () => {
    if (mode === 'create') {
      return 'Crea un nuevo estado para organizar tus conversaciones.'
    }
    return 'Modifica los campos de este estado.'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej: Nuevo, En Progreso, Terminado'
                      {...field}
                      disabled={isSubmitting}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='orderNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de orden *</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='1'
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='color'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (opcional)</FormLabel>
                  <div className='flex gap-2 items-center'>
                    <FormControl>
                      <Input
                        type='color'
                        {...field}
                        disabled={isSubmitting}
                        className='w-20 h-10 cursor-pointer'
                      />
                    </FormControl>
                    <Input
                      type='text'
                      placeholder='#3b82f6'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      maxLength={7}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

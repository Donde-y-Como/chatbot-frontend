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
import { Unit, unitSchema, UnitFormValues } from '../types'

interface UnitDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: UnitFormValues) => Promise<void>
  isSubmitting: boolean
  initialData?: Unit
  title: string
  submitLabel: string
}

export function UnitDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitLabel,
}: UnitDialogProps) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
    },
  })

  // Resetear el formulario cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        abbreviation: initialData.abbreviation,
      })
    } else {
      form.reset({
        name: '',
        abbreviation: '',
      })
    }
  }, [initialData]) // Remover 'form' de las dependencias

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      await onSubmit(values)
      form.reset()
      onClose()
    } catch (error) {
      // Los errores se manejan en los hooks
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {title === 'Crear unidad' 
              ? 'Ingresa el nombre y la abreviación de la nueva unidad de medida.'
              : 'Modifica el nombre y/o la abreviación de la unidad.'}
          </DialogDescription>
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
                      placeholder='Ej: Litros, Kilogramos, Metros' 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='abbreviation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviación *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ej: L, kg, m' 
                      {...field} 
                      className='font-mono'
                      disabled={isSubmitting}
                    />
                  </FormControl>
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

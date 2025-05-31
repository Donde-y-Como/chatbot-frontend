import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Loader2, Palette } from 'lucide-react'
import { 
  Tag, 
  tagSchema, 
  simpleTagSchema, 
  TagFormValues, 
  SimpleTagFormValues, 
  TagDialogMode
} from '../types'

interface TagDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: TagFormValues | SimpleTagFormValues) => Promise<void>
  isSubmitting: boolean
  initialData?: Tag
  title: string
  submitLabel: string
  mode: TagDialogMode
}

export function TagDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitLabel,
  mode,
}: TagDialogProps) {
  const isSimpleMode = mode === 'create-simple'
  const schema = isSimpleMode ? simpleTagSchema : tagSchema

  const form = useForm<TagFormValues | SimpleTagFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isSimpleMode 
      ? { name: '' }
      : { name: '', description: '' },
  })

  // Resetear el formulario cuando cambie initialData
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        name: initialData.name,
        ...(isSimpleMode ? {} : {
          description: initialData.description,
        }),
      })
    } else {
      form.reset(isSimpleMode 
        ? { name: '' }
        : { name: '', description: '' }
      )
    }
  }, [initialData, mode, isSimpleMode])

  const handleSubmit = async (values: TagFormValues | SimpleTagFormValues) => {
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

  const getDialogDescription = () => {
    if (mode === 'create-simple') {
      return 'Crea una etiqueta rápida con solo el nombre.'
    }
    if (mode === 'create-complete') {
      return 'Crea una etiqueta nueva'
    }
    return 'Modifica los campos de esta etiqueta.'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
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
                      placeholder='Ej: Oferta, Vegano, Nuevo' 
                      {...field} 
                      disabled={isSubmitting}
                      maxLength={30}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Descripción - Solo para modo completo y edición */}
            {!isSimpleMode && (
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='Describe para qué se usa esta etiqueta...'
                        className='resize-none min-h-[80px]'
                        {...field} 
                        disabled={isSubmitting}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

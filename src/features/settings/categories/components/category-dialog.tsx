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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Category, categorySchema, CategoryFormValues } from '../types'

interface CategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CategoryFormValues) => Promise<void>
  isSubmitting: boolean
  initialData?: Category
  parentCategories?: Category[]
  selectedParentCategory?: Category
  title: string
  submitLabel: string
  mode: 'create' | 'edit' | 'create-subcategory'
}

export function CategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  parentCategories = [],
  selectedParentCategory,
  title,
  submitLabel,
  mode,
}: CategoryDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parentCategoryId: undefined,
    },
  })

  // Resetear el formulario cuando cambie initialData o selectedParentCategory
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        parentCategoryId: initialData.parentCategoryId || undefined,
      })
    } else if (selectedParentCategory && mode === 'create-subcategory') {
      form.reset({
        name: '',
        description: '',
        parentCategoryId: selectedParentCategory.id,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        parentCategoryId: undefined,
      })
    }
  }, [initialData, selectedParentCategory, mode, form.reset])

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      const submitValues: CategoryFormValues = {
        ...values,
        parentCategoryId: mode === 'create' 
          ? undefined 
          : mode === 'create-subcategory'
            ? selectedParentCategory?.id
            : values.parentCategoryId
      }
      
      await onSubmit(submitValues)
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
    if (mode === 'create-subcategory') {
      return `Crea una subcategoría dentro de "${selectedParentCategory?.name}".`
    }
    if (mode === 'edit') {
      const categoryType = initialData?.parentCategoryId ? 'subcategoría' : 'categoría'
      return `Modifica los campos de esta ${categoryType}.`
    }
    return 'Crea una nueva categoría padre para organizar tus productos.'
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
            {/* Mostrar categoría padre solo como información (no editable) */}
            {mode === 'create-subcategory' && selectedParentCategory && (
              <div className='rounded-lg border p-4 bg-muted/30'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>Se creará como subcategoría de:</span>
                  <Badge variant='outline' className='font-medium'>
                    {selectedParentCategory.name}
                  </Badge>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ej: Cremas faciales, Cremas corporales' 
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
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='Describe esta subcategoría...'
                      className='resize-none min-h-[80px]'
                      {...field} 
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

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
  TagDialogMode,
  PREDEFINED_COLORS 
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
  const [selectedColor, setSelectedColor] = useState('#22C55E')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const isSimpleMode = mode === 'create-simple'
  const schema = isSimpleMode ? simpleTagSchema : tagSchema

  const form = useForm<TagFormValues | SimpleTagFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isSimpleMode 
      ? { name: '' }
      : { name: '', color: '#22C55E', description: '' },
  })

  // Resetear el formulario cuando cambie initialData
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        name: initialData.name,
        ...(isSimpleMode ? {} : {
          color: initialData.color,
          description: initialData.description,
        }),
      })
      if (!isSimpleMode) {
        setSelectedColor(initialData.color)
      }
    } else {
      form.reset(isSimpleMode 
        ? { name: '' }
        : { name: '', color: '#22C55E', description: '' }
      )
      setSelectedColor('#22C55E')
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
    setShowColorPicker(false)
    onClose()
  }

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue)
    if (!isSimpleMode) {
      form.setValue('color' as keyof (TagFormValues | SimpleTagFormValues), colorValue)
    }
    setShowColorPicker(false)
  }

  const getDialogDescription = () => {
    if (mode === 'create-simple') {
      return 'Crea una etiqueta rápida con solo el nombre.'
    }
    if (mode === 'create-complete') {
      return 'Crea una etiqueta completa con nombre, color y descripción.'
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

            {/* Color selector - Solo para modo completo y edición */}
            {!isSimpleMode && (
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color *</FormLabel>
                    <div className='space-y-3'>
                      {/* Vista previa del color seleccionado */}
                      <div className='flex items-center gap-3'>
                        <div 
                          className='w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer'
                          style={{ backgroundColor: selectedColor }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          title='Click para cambiar color'
                        />
                        <FormControl>
                          <Input
                            {...field}
                            value={selectedColor}
                            onChange={(e) => {
                              const value = e.target.value
                              setSelectedColor(value)
                              field.onChange(value)
                            }}
                            placeholder='#22C55E'
                            className='font-mono'
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          disabled={isSubmitting}
                        >
                          <Palette className='h-4 w-4' />
                        </Button>
                      </div>

                      {/* Selector de colores predefinidos */}
                      {showColorPicker && (
                        <div className='grid grid-cols-8 gap-2 p-3 border rounded-lg bg-muted/30'>
                          {PREDEFINED_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type='button'
                              className='w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform'
                              style={{ backgroundColor: color.value }}
                              onClick={() => handleColorSelect(color.value)}
                              title={color.name}
                              disabled={isSubmitting}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

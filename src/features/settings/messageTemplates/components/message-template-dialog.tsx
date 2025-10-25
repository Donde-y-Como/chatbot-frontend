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
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Info } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MessageTemplate,
  messageTemplateSchema,
  MessageTemplateFormValues,
  MessageTemplateDialogMode,
  templateTypeLabels,
  templateTypeDescriptions,
  availableVariables,
  MessageTemplateType,
} from '../types'

interface MessageTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: MessageTemplateFormValues) => Promise<void>
  isSubmitting: boolean
  initialData?: MessageTemplate
  title: string
  submitLabel: string
  mode: MessageTemplateDialogMode
}

export function MessageTemplateDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitLabel,
  mode,
}: MessageTemplateDialogProps) {
  const form = useForm<MessageTemplateFormValues>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      type: 'appointment_created',
      template: '',
      isActive: true,
      language: 'es',
    },
  })

  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        type: initialData.type,
        template: initialData.template,
        isActive: initialData.isActive,
        language: initialData.language,
      })
    } else {
      form.reset({
        type: 'appointment_created',
        template: '',
        isActive: true,
        language: 'es',
      })
    }
  }, [initialData, mode, form.reset])

  const handleSubmit = async (values: MessageTemplateFormValues) => {
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

  const insertVariable = (variable: string) => {
    const currentTemplate = form.getValues('template')
    form.setValue('template', `${currentTemplate}${variable}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Crea una plantilla personalizada para los mensajes automáticos.'
              : 'Modifica la plantilla de mensaje.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de evento *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === 'edit' || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona el tipo de evento' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(templateTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className='flex flex-col'>
                            <span>{label}</span>
                            <span className='text-xs text-muted-foreground'>
                              {templateTypeDescriptions[value as MessageTemplateType]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mode === 'edit' && (
                    <FormDescription>
                      El tipo de evento no se puede modificar en plantillas existentes
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='template'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plantilla del mensaje *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Escribe tu mensaje aquí. Usa las variables disponibles para personalizar el contenido.'
                      className='resize-none min-h-[150px] font-mono text-sm'
                      {...field}
                      disabled={isSubmitting}
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/1000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                <div className='space-y-2'>
                  <p className='font-medium'>Variables disponibles:</p>
                  <div className='grid grid-cols-2 gap-2 text-xs'>
                    {availableVariables.map((variable) => (
                      <Button
                        key={variable.name}
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => insertVariable(variable.name)}
                        className='justify-start h-auto py-2'
                      >
                        <div className='flex flex-col items-start'>
                          <code className='font-mono font-semibold'>{variable.name}</code>
                          <span className='text-muted-foreground font-normal'>
                            {variable.description}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Plantilla activa</FormLabel>
                    <FormDescription>
                      Solo las plantillas activas se usarán para enviar mensajes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose} disabled={isSubmitting}>
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

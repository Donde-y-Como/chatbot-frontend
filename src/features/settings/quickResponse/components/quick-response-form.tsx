import * as React from 'react'
import { useState } from 'react'
import { useForm, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/file-upload.tsx'
import { useUploadMedia } from '@/features/chats/hooks/useUploadMedia.ts'
import {
  QuickResponse,
  QuickResponseFormValues,
  quickResponseSchema,
} from '../types'

interface QuickResponseFormProps {
  onSubmit: (data: QuickResponseFormValues) => void
  initialData?: QuickResponse
  isSubmitting: boolean
  submitLabel: string
}

export function QuickResponseForm({
  onSubmit: onSubmitCallBack,
  initialData,
  isSubmitting,
  submitLabel,
}: QuickResponseFormProps) {
  const [medias, setMedias] = useState<File[]>([])
  const form = useForm<QuickResponseFormValues>({
    resolver: zodResolver(quickResponseSchema),
    defaultValues: {
      title: initialData?.title || '/',
      content: initialData?.content || '',
      medias: initialData?.medias || [],
      assistantConfig: initialData?.assistantConfig || { enabled: false },
    },
  })

  const { uploadFile, isUploading } = useUploadMedia()

  const handleMediaUpload = React.useCallback(
    async (file: File) => {
      try {
        const url = await uploadFile(file)
        form.setValue('medias', [
          ...form.getValues('medias'),
          {
            url,
            type: file.type.includes('image')
              ? 'image'
              : file.type.includes('video')
                ? 'video'
                : file.type.includes('audio')
                  ? 'audio'
                  : 'document',
          },
        ])
      } catch (error) {
        toast.error('Hubo un error al subir el archivo')
      }
    },
    [uploadFile, form]
  )

  const isAssistantEnabled = form.watch('assistantConfig.enabled')

  const onSubmit = async (_data: QuickResponseFormValues) => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Por favor, completa todos los campos obligatorios.')
      return
    }

    if (medias.length > 0) {
      for (const media of medias) {
        await handleMediaUpload(media)
      }
    }

    onSubmitCallBack(form.getValues())
    setMedias([])
  }

  const onError = (error: FieldErrors) => {
    console.warn(error)
    toast.error('Hubo un error en el formulario')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className='space-y-4'
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Atajo</FormLabel>
              <FormControl>
                <Input placeholder='/gracias' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Gracias por contactarnos...'
                  {...field}
                  rows={4}
                  className='resize-none'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='assistantConfig.enabled'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>
                  Visible para el asistente
                </FormLabel>
                <FormDescription className='text-sm text-muted-foreground'>
                  El asistente podra responder con esta respuesta rapida
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {isAssistantEnabled && (
          <FormField
            control={form.control}
            name='assistantConfig.useCase'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Uso</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Cuando me pregunten por mis servicios...'
                    {...field}
                    rows={3}
                    className='resize-none'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className='my-2'>
          <FileUpload
            maxFiles={20}
            accept={{
              'image/*': [],
              'video/*': [],
              'application/pdf': ['.pdf'],
              'audio/*': [],
            }}
            maxSize={1000 * 1024 * 1024}
            value={medias}
            onChange={(files: File[]) => setMedias(files)}
          />
        </div>

        {initialData && initialData.medias.length > 0 && (
          <div className='mt-2'>
            <Label>Multimedia actual</Label>
            <div className='mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {initialData.medias.map((media, index) => (
                <div
                  key={`${initialData.id}-media-${index}`}
                  className='group relative aspect-square overflow-hidden rounded-lg border bg-background'
                >
                  <img
                    src={media.url}
                    alt={media.caption}
                    className='h-full w-full object-cover transition-all hover:opacity-80'
                  />
                  <Button
                    variant='destructive'
                    size='icon'
                    className='absolute top-1 right-1 h-6 w-6 rounded-full'
                    onClick={() => {
                      const updatedPhotos = [
                        ...(initialData.medias ?? form.getValues('medias')),
                      ]
                      updatedPhotos.splice(index, 1)
                      form.setValue('medias', updatedPhotos)
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type='submit' disabled={isSubmitting || isUploading}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  )
}

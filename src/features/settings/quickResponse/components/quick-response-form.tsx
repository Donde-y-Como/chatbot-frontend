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
import { FileText, Video, Image as ImageIcon } from 'lucide-react'
import {
  QuickResponse,
  QuickResponseFormValues,
  quickResponseSchema,
} from '../types'

function fileKey(file: File) {
  return `${file.name}__${file.size}__${file.lastModified}`
}

function normalizeQuickResponseMediaType(type?: string) {
  const t = (type ?? '').toLowerCase()
  if (!t) return undefined
  if (t.includes('audio')) return undefined
  if (t === 'image' || t === 'imagemessage' || t.includes('image')) return 'image' as const
  if (t === 'video' || t.includes('video')) return 'video' as const
  if (t === 'document' || t.includes('pdf') || t.includes('application/')) return 'document' as const
  return undefined
}

function inferFilenameFromUrl(url: string, mimetype?: string) {
  const mt = (mimetype || '').toLowerCase()
  const extFromMime = (() => {
    if (mt === 'application/pdf') return '.pdf'
    if (mt === 'text/plain') return '.txt'
    if (mt === 'application/vnd.ms-excel') return '.xls'
    if (mt === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return '.xlsx'
    if (mt === 'application/msword') return '.doc'
    if (mt === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx'
    if (mt === 'application/vnd.ms-powerpoint') return '.ppt'
    if (mt === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return '.pptx'
    if (mt === 'video/mp4') return '.mp4'
    if (mt === 'image/png') return '.png'
    if (mt === 'image/jpg' || mt === 'image/jpeg') return '.jpg'
    return ''
  })()

  const fromUrl = (() => {
    try {
      const parsed = new URL(url)
      const last = parsed.pathname.split('/').filter(Boolean).pop()
      return last ? decodeURIComponent(last) : 'archivo'
    } catch {
      const last = url.split('/').pop()
      return last || 'archivo'
    }
  })()

  if (fromUrl.includes('.')) return fromUrl
  return `${fromUrl}${extFromMime}`
}

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
  const [mediaCaptions, setMediaCaptions] = useState<Record<string, string>>({})

  const normalizedInitialMedias = React.useMemo<QuickResponseFormValues['medias']>(
    () =>
      (initialData?.medias ?? []).flatMap((media) => {
        const normalizedType = normalizeQuickResponseMediaType(media.type)
        if (!normalizedType || !media.url) return []
        const inferredFilename = media.filename || inferFilenameFromUrl(media.url, media.mimetype)
        return [
          {
            type: normalizedType,
            url: media.url,
            caption: media.caption || undefined,
            filename: inferredFilename || undefined,
            mimetype: media.mimetype || undefined,
          },
        ]
      }),
    [initialData]
  )

  const form = useForm<QuickResponseFormValues>({
    resolver: zodResolver(quickResponseSchema),
    defaultValues: {
      title: initialData?.title || '/',
      content: initialData?.content || '',
      medias: normalizedInitialMedias,
      assistantConfig: initialData?.assistantConfig || { enabled: false },
    },
  })

  const { uploadFile, isUploading, validateFile } = useUploadMedia()

  React.useEffect(() => {
    setMediaCaptions((prev) => {
      const next: Record<string, string> = {}
      for (const file of medias) {
        const key = fileKey(file)
        next[key] = prev[key] ?? ''
      }
      return next
    })
  }, [medias])

  const handleMediaUpload = React.useCallback(
    async (file: File) => {
      try {
        const { isValid, type } = validateFile(file)
        if (!isValid || !type) {
          toast.error('Tipo de archivo no permitido')
          return
        }

        const url = await uploadFile(file)
        const caption = mediaCaptions[fileKey(file)]?.trim()

        form.setValue('medias', [
          ...form.getValues('medias'),
          {
            url,
            type,
            caption: caption ? caption : undefined,
            filename: file.name,
            mimetype: file.type,
          },
        ])
      } catch (error) {
        toast.error('Hubo un error al subir el archivo')
      }
    },
    [uploadFile, form, mediaCaptions, validateFile]
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
    setMediaCaptions({})
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
              'text/plain': ['.txt'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                '.xlsx',
              ],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                '.docx',
              ],
              'application/vnd.ms-powerpoint': ['.ppt'],
              'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
                '.pptx',
              ],
            }}
            maxSize={1000 * 1024 * 1024}
            value={medias}
            onChange={(files: File[]) => setMedias(files)}
          />
        </div>

        {medias.length > 0 && (
          <div className='space-y-3 rounded-lg border p-4'>
            <div className='text-sm font-medium'>Texto para la imagen (opcional)</div>
            <div className='space-y-3'>
              {medias.map((file) => {
                const key = fileKey(file)
                const { type } = validateFile(file)
                const KindIcon = type === 'image' ? ImageIcon : type === 'video' ? Video : FileText
                return (
                  <div key={key} className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <KindIcon className='h-4 w-4' />
                      <span className='break-all'>{file.name}</span>
                    </div>
                    <Input
                      placeholder='Texto para la imagen (opcional)'
                      value={mediaCaptions[key] ?? ''}
                      onChange={(e) =>
                        setMediaCaptions((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      disabled={isUploading}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {initialData && form.watch('medias').length > 0 && (
          <div className='mt-2'>
            <Label>Multimedia actual</Label>
            <div className='mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {form.watch('medias').map((media, index) => (
                <div
                  key={`${initialData.id}-media-${index}`}
                  className='group relative aspect-square overflow-hidden rounded-lg border bg-background'
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.caption || media.filename || ''}
                      className='h-full w-full object-cover transition-all hover:opacity-80'
                    />
                  ) : media.type === 'video' ? (
                    <video
                      src={media.url}
                      controls
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-muted-foreground'>
                      <FileText className='h-6 w-6' />
                      <div className='text-xs text-center break-words'>
                        {media.filename || media.url}
                      </div>
                    </div>
                  )}
                  <Button
                    variant='destructive'
                    size='icon'
                    className='absolute top-1 right-1 h-6 w-6 rounded-full'
                    onClick={() => {
                      const updatedMedias = [...form.getValues('medias')]
                      updatedMedias.splice(index, 1)
                      form.setValue('medias', updatedMedias)
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

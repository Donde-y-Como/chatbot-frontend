import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, FileText, User } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUploadMedia } from '../../chats/hooks/useUploadMedia'
import { ClientApiService } from '../ClientApiService'
import { useGetTags } from '../hooks/useGetTags'
import {
  Annex,
  ClientPrimitives,
  CreateClientForm,
  createClientSchema,
  editClientSchema,
} from '../types'
import { ClientDataSection } from './form/client-data-section'
import { ClientDetailsSection } from './form/client-details-section'

interface ClientActionDialogProps {
  currentClient?: ClientPrimitives
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientActionDialog({
  currentClient,
  open,
  onOpenChange,
}: ClientActionDialogProps) {
  const isEdit = !!currentClient
  const { data: tags, isLoading: tagsIsLoading } = useGetTags()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState('basic')
  const [photos, setPhotos] = useState<File[]>([])
  const [isUploadingAnnexes, setIsUploadingAnnexes] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { uploadFile, validateFile, isUploading } = useUploadMedia()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const queryClient = useQueryClient()
  const clientMutation = useMutation({
    mutationKey: ['client-form'],
    mutationFn: async (values: CreateClientForm) => {
      if (isEdit && currentClient) {
        await ClientApiService.update(currentClient.id, values)
        return
      }
      await ClientApiService.create(values)
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['clients'] })
      toast.success('Cliente guardado correctamente')

      // Clear pending annexes
      try {
        if ((window as any)._clearClientPendingAnnexes) {
          ;(window as any)._clearClientPendingAnnexes()
        }
      } catch (error) {
        console.warn('Error clearing pending annexes:', error)
      }

      form.reset()
      setPhotos([])
      setUploadError(null)
      setUploadProgress(0)
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Error al guardar cliente')
      setIsSubmitting(false)
      setIsUploadingAnnexes(false)
    },
  })

  const form = useForm<CreateClientForm>({
    resolver: zodResolver(isEdit ? editClientSchema : createClientSchema),
    defaultValues: isEdit
      ? {
          platformIdentities: currentClient.platformIdentities,
          name: currentClient.name,
          tagIds: currentClient.tagIds,
          annexes: currentClient.annexes,
          photo: currentClient.photo,
          notes: currentClient.notes,
          email: currentClient.email,
          address: currentClient.address,
          birthdate: currentClient.birthdate,
        }
      : {
          name: '',
          email: '',
          address: '',
          photo: '',
          notes: '',
          platformIdentities: [],
          tagIds: [],
          annexes: [],
        },
  })

  const handleImageUpload = useCallback(
    async (file: File) => {
      const { isValid } = validateFile(file)
      if (!isValid) {
        form.setError('photo', { message: 'El archivo no es válido' })
        toast.error('El archivo no es válido')
        return
      }

      try {
        const url = await uploadFile(file)
        form.setValue('photo', url)
      } catch (error) {
        toast.error('Hubo un error al subir la imagen')
      }
    },
    [uploadFile, validateFile, form]
  )

  const uploadAnnexes = async (pendingAnnexes: any[]): Promise<Annex[]> => {
    const uploadedAnnexes: Annex[] = []

    for (let i = 0; i < pendingAnnexes.length; i++) {
      const pendingAnnex = pendingAnnexes[i]
      setUploadProgress(Math.round(((i + 0.5) / pendingAnnexes.length) * 100))

      try {
        const url = await uploadFile(pendingAnnex.file)
        uploadedAnnexes.push({
          name: pendingAnnex.name,
          media: {
            type: pendingAnnex.type,
            url: url,
            filename: pendingAnnex.file.name,
            mimetype: pendingAnnex.file.type,
          },
        })
        setUploadProgress(Math.round(((i + 1) / pendingAnnexes.length) * 100))
      } catch (error) {
        throw new Error(`Error subiendo ${pendingAnnex.name}: ${error}`)
      }
    }

    return uploadedAnnexes
  }

  const onSubmit = async (data: CreateClientForm) => {
    setIsSubmitting(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      // Upload photo if provided
      if (photos.length > 0) {
        await handleImageUpload(photos[0])
      }

      // Get pending annexes from the form component
      const pendingAnnexes = (window as any)._getClientPendingAnnexes
        ? (window as any)._getClientPendingAnnexes()
        : []

      let finalAnnexes = [...(form.getValues('annexes') || [])]

      // Upload pending annexes if any
      if (pendingAnnexes.length > 0) {
        setIsUploadingAnnexes(true)

        try {
          const uploadedAnnexes = await uploadAnnexes(pendingAnnexes)
          finalAnnexes = [...finalAnnexes, ...uploadedAnnexes]
          setIsUploadingAnnexes(false)
        } catch (error) {
          setUploadError(
            error instanceof Error ? error.message : 'Error al subir anexos'
          )
          setIsSubmitting(false)
          setIsUploadingAnnexes(false)
          return
        }
      }

      // Get the latest form values and add uploaded annexes
      // In edit mode, if no pending annexes and no existing annexes changed, preserve original annexes
      const formValues = form.getValues()
      let annexesToSend = finalAnnexes

      if (isEdit && pendingAnnexes.length === 0 && currentClient) {
        // If no new annexes were added and no existing ones were removed, keep original annexes
        const currentFormAnnexes = formValues.annexes || []
        const originalAnnexes = currentClient.annexes || []
        
        // If current form annexes are the same as original, preserve them
        if (currentFormAnnexes.length === originalAnnexes.length) {
          annexesToSend = originalAnnexes
        }
      }

      const formData = {
        ...formValues,
        annexes: annexesToSend,
      }

      clientMutation.mutate(formData)
    } catch (error) {
      toast.error('Error al procesar los datos')
      setIsSubmitting(false)
      setIsUploadingAnnexes(false)
    }
  }

  if (!tags || tagsIsLoading) return <div>Cargando...</div>

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
          setPhotos([])
          setSelectedTab('basic')
          setUploadError(null)
          setUploadProgress(0)

          // Clear pending annexes
          try {
            if ((window as any)._clearClientPendingAnnexes) {
              ;(window as any)._clearClientPendingAnnexes()
            }
          } catch (error) {
            console.warn('Error clearing pending annexes:', error)
          }
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar cliente' : 'Agregar Nuevo cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza la información del client aquí.'
              : 'Ingresa la información del nuevo client.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh] w-full'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'
              id='client-form'
            >
              {isMobile ? (
                <div className='space-y-8 flex flex-col justify-center'>
                  <ClientDataSection form={form} tags={tags} />
                  <ClientDetailsSection
                    form={form}
                    files={photos}
                    onFilesChange={setPhotos}
                    clientId={currentClient?.id}
                  />
                </div>
              ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger
                      value='basic'
                      className='flex items-center gap-2'
                    >
                      <User className='h-4 w-4' />
                      Información Básica
                    </TabsTrigger>
                    <TabsTrigger
                      value='details'
                      className='flex items-center gap-2'
                    >
                      <FileText className='h-4 w-4' />
                      Detalles y Documentos
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='basic' className='w-full '>
                    <ClientDataSection form={form} tags={tags} />
                  </TabsContent>
                  <TabsContent value='details'>
                    <ClientDetailsSection
                      form={form}
                      files={photos}
                      onFilesChange={setPhotos}
                      clientId={currentClient?.id}
                    />
                  </TabsContent>
                </Tabs>
              )}

              {/* Upload Progress */}
              {isUploadingAnnexes && (
                <div className='space-y-2 mx-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Subiendo anexos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className='w-full' />
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className='mx-4'>
                  <Alert variant='destructive'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription className='whitespace-pre-line'>
                      {uploadError}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <DialogFooter className='mt-4 pt-4 border-t bg-background'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting || isUploading || isUploadingAnnexes}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || isUploading || isUploadingAnnexes}
                  className='min-w-[120px]'
                >
                  {isUploadingAnnexes
                    ? `Subiendo anexos... ${uploadProgress}%`
                    : isSubmitting || isUploading
                      ? 'Guardando...'
                      : isEdit
                        ? 'Actualizar Cliente'
                        : 'Crear Cliente'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

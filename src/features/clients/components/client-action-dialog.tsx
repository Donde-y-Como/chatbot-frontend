import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { useMediaQuery } from "react-responsive"
import { toast } from "sonner"
import { useUploadMedia } from "../../chats/hooks/useUploadMedia"
import { ClientApiService } from "../ClientApiService"
import { ClientPrimitives, CreateClientForm, createClientSchema, editClientSchema } from "../types"
import { ClientDataSection } from "./form/client-data-section"
import { useGetTags } from "../hooks/useGetTags"
import { ClientDetailsSection } from "./form/client-details-section"

interface ClientActionDialogProps {
  currentClient?: ClientPrimitives
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientActionDialog({ currentClient, open, onOpenChange }: ClientActionDialogProps) {
  const isEdit = !!currentClient
  const { data: tags, isLoading: tagsIsLoading } = useGetTags()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState("user")
  const [photos, setPhotos] = useState<File[]>([])
  const { uploadFile, validateFile, isUploading } = useUploadMedia()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const queryClient = useQueryClient()
  const clientMutation = useMutation({
    mutationKey: ['client-form'],
    mutationFn: async (values: CreateClientForm) => {
      if (isEdit && currentClient) {
        await ClientApiService.update(values)
        return
      }
      await ClientApiService.create(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente guardado correctamente')
      form.reset()
      setPhotos([])
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Error al guardar cliente')
    },
  })

  const form = useForm<CreateClientForm>({
    resolver: zodResolver(isEdit ? editClientSchema : createClientSchema),
    defaultValues: isEdit ? {
      platformIdentities: currentClient.platformIdentities,
      name: currentClient.name,
      tagIds: currentClient.tagIds,
      annexes: currentClient.annexes,
      photo: currentClient.photo,
      notes: currentClient.notes,
      email: currentClient.email,
      address: currentClient.address,
      birthdate: currentClient.birthdate
    } : {
      name: "",
      email: "",
      address: "",
      photo: "",
      notes: "",
      platformIdentities: [],
      tagIds: [],
      annexes: [],
    },
  })

  const handleImageUpload = useCallback(
    async (file: File) => {
      const { isValid } = validateFile(file)
      if (!isValid) {
        form.setError("photo", { message: "El archivo no es válido" })
        toast.error("El archivo no es válido")
        return
      }

      try {
        const url = await uploadFile(file)
        form.setValue("photo", url)
      } catch (error) {
        toast.error("Hubo un error al subir la imagen")
      }
    },
    [uploadFile, validateFile, form],
  )

  const onSubmit = async () => {
    setIsSubmitting(true)
    if (photos.length > 0) {
      await handleImageUpload(photos[0])
    }
    clientMutation.mutate(form.getValues())
    setIsSubmitting(false)
  }

  if (!tags || tagsIsLoading) return <div>Cargando...</div>

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        setPhotos([])
        onOpenChange(state)
      }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Agregar Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Actualiza la información del client aquí." : "Ingresa la información del nuevo client."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="client-form">
              {isMobile ? (
                <div className="space-y-8 flex flex-col justify-center">
                  <ClientDataSection form={form} tags={tags} />
                  <ClientDetailsSection
                      form={form}
                      files={photos}
                      onFilesChange={setPhotos}
                    />
                </div>
              ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="user">Datos del cliente</TabsTrigger>
                    <TabsTrigger value="client">Detalles de cliente</TabsTrigger>
                  </TabsList>
                  <TabsContent value="user" className="w-full ">
                    <ClientDataSection form={form} tags={tags} />
                  </TabsContent>
                  <TabsContent value="client">
                    <ClientDetailsSection
                      form={form}
                      files={photos}
                      onFilesChange={setPhotos}
                    />
                  </TabsContent>
                </Tabs>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  form='client-form'
                >
                  {isSubmitting || isUploading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

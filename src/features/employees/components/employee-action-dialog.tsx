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
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { useMediaQuery } from "react-responsive"
import { toast } from "sonner"
import { useUploadMedia } from "../../chats/hooks/useUploadMedia"
import { EmployeeService } from "../EmployeeService"
import { Employee, employeeEditFormSchema, employeeFormSchema, EmployeeFormValues } from "../types"
import { EmployeeDataSection } from "./form/employee-data-section"
import { ScheduleSection } from "./form/schedule-section"
import { UserDataSection } from "./form/user-data-section"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface EmployeeActionDialogProps {
  currentEmployee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeActionDialog({ currentEmployee, open, onOpenChange }: EmployeeActionDialogProps) {
  const isEdit = !!currentEmployee
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState("user")
  const [photos, setPhotos] = useState<File[]>([])
  const { uploadFile, validateFile, isUploading } = useUploadMedia()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const queryClient = useQueryClient()
  const employeeMutation = useMutation({
    mutationKey: ['employee-form'],
    mutationFn: async (values: EmployeeFormValues) => {
      if (isEdit && currentEmployee) {
        await EmployeeService.updateEmployee(currentEmployee.id, values)
        return
      }
      await EmployeeService.createEmployee(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Empleado guardado correctamente')
      form.reset()
      setPhotos([])
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Error al guardar empleado')
    },
  })

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(isEdit ? employeeEditFormSchema : employeeFormSchema),
    defaultValues: isEdit ? {
      name: currentEmployee.name,
      role: currentEmployee.role,
      email: currentEmployee.email,
      password: "",
      birthDate: currentEmployee.birthDate,
      address: currentEmployee.address,
      schedule: currentEmployee.schedule
    } : {
      name: "",
      role: "",
      email: "",
      password: "",
      address: "",
      schedule: {
        MONDAY: { startAt: 480, endAt: 1020 },
        TUESDAY: { startAt: 480, endAt: 1020 },
        WEDNESDAY: { startAt: 480, endAt: 1020 },
        THURSDAY: { startAt: 480, endAt: 1020 },
        FRIDAY: { startAt: 480, endAt: 1020 },
      },
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
    employeeMutation.mutate(form.getValues())
    setIsSubmitting(false)
  }

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
          <DialogTitle>{isEdit ? "Editar Empleado" : "Agregar Nuevo Empleado"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Actualiza la información del empleado aquí." : "Ingresa la información del nuevo empleado."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="employee-form">
              {isMobile ? (
                <div className="space-y-8 flex flex-col justify-center">
                  <UserDataSection form={form} isEdit={isEdit} />
                  <EmployeeDataSection
                    form={form}
                    files={photos}
                    onFilesChange={setPhotos}
                  />
                  <ScheduleSection form={form} />
                </div>
              ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="user">Datos del Usuario</TabsTrigger>
                    <TabsTrigger value="employee">Datos del Empleado</TabsTrigger>
                    <TabsTrigger value="schedule">Horario</TabsTrigger>
                  </TabsList>
                  <TabsContent value="user" className="w-full grid place-items-center">
                    <UserDataSection form={form} isEdit={isEdit} />
                  </TabsContent>
                  <TabsContent value="employee">
                    <EmployeeDataSection
                      form={form}
                      files={photos}
                      onFilesChange={setPhotos}
                    />
                  </TabsContent>
                  <TabsContent value="schedule">
                    <ScheduleSection form={form} />
                  </TabsContent>
                </Tabs>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  form='employee-form'
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

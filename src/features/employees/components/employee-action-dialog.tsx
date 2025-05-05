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

  // Función para verificar si ha rellenado algún campo
  const hasFilledFields = useCallback(() => {
    const values = form.getValues();
    const defaultValues = isEdit ? {
      name: currentEmployee?.name || "",
      role: currentEmployee?.role || "",
      email: currentEmployee?.email || "",
      password: "",
      birthDate: currentEmployee?.birthDate || "",
      address: currentEmployee?.address || ""
    } : {
      name: "",
      role: "",
      email: "",
      password: "",
      address: ""
    };

    // Comparar valores actuales con valores por defecto
    if (values.name !== defaultValues.name) return true;
    if (values.role !== defaultValues.role) return true;
    if (values.email !== defaultValues.email) return true;
    if (values.password !== defaultValues.password) return true;
    if (values.address !== defaultValues.address) return true;
    if (values.birthDate !== defaultValues.birthDate) return true;
    if (photos.length > 0) return true;

    return false;
  }, [form, photos, isEdit, currentEmployee]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && hasFilledFields()) {
          return;
        }
        form.reset();
        setPhotos([]);
        onOpenChange(isOpen);
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
                    <div className="flex justify-between gap-4 w-full mt-6">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => {
                          form.reset();
                          setPhotos([]);
                          onOpenChange(false);
                        }}
                        disabled={isSubmitting || isUploading}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setSelectedTab("employee")}
                      >
                        Continuar
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="employee">
                    <EmployeeDataSection
                      form={form}
                      files={photos}
                      onFilesChange={setPhotos}
                    />
                    <div className="flex justify-between gap-4 w-full mt-6">
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          type="button"
                          onClick={() => {
                            form.reset();
                            setPhotos([]);
                            onOpenChange(false);
                          }}
                          disabled={isSubmitting || isUploading}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="outline" 
                          type="button"
                          onClick={() => setSelectedTab("user")}
                        >
                          Atrás
                        </Button>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => setSelectedTab("schedule")}
                      >
                        Continuar
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="schedule">
                    <ScheduleSection form={form} />
                    <div className="flex justify-between gap-4 w-full mt-6">
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          type="button"
                          onClick={() => {
                            form.reset();
                            setPhotos([]);
                            onOpenChange(false);
                          }}
                          disabled={isSubmitting || isUploading}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="outline" 
                          type="button"
                          onClick={() => setSelectedTab("employee")}
                        >
                          Atrás
                        </Button>
                      </div>
                      <Button 
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        form='employee-form'
                      >
                        {isSubmitting || isUploading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar cambios"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

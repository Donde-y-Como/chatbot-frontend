import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Clock } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'
import { toast } from 'sonner'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScheduleService } from '@/features/settings/profile/ProfileService.ts'
import { useUploadMedia } from '../../chats/hooks/useUploadMedia'
import { EmployeeService } from '../EmployeeService'
import {
  Employee,
  employeeEditFormSchema,
  employeeFormSchema,
  EmployeeFormValues,
} from '../types'
import { EmployeeInfoSection } from './form/employee-info-section'
import { ScheduleSection } from './form/schedule-section'
import { AxiosError } from 'axios'

interface EmployeeActionDialogProps {
  currentEmployee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeActionDialog({
  currentEmployee,
  open,
  onOpenChange,
}: EmployeeActionDialogProps) {
  const isEdit = !!currentEmployee
  const [selectedTab, setSelectedTab] = useState('employee')
  const [photos, setPhotos] = useState<File[]>([])
  const { uploadFile, validateFile, isUploading } = useUploadMedia()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const queryClient = useQueryClient()
  const userScheduleQuery = useQuery({
    queryKey: ['user-schedule'],
    queryFn: async () => {
      return await ScheduleService.getSchedule()
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const defaultSchedule = {
    MONDAY: { startAt: 480, endAt: 1020 },
    TUESDAY: { startAt: 480, endAt: 1020 },
    WEDNESDAY: { startAt: 480, endAt: 1020 },
    THURSDAY: { startAt: 480, endAt: 1020 },
    FRIDAY: { startAt: 480, endAt: 1020 },
  }

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
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success(isEdit ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente')
      form.reset()
      setPhotos([])
      setSelectedTab('employee')
      onOpenChange(false)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.title || error.message)
      } else {
        toast.error('Hubo un error al guardar el empleado')
      }
    },
  })

  // Get the schedule to use: user's schedule if creating, current employee's if editing, or default
  const getInitialSchedule = () => {
    if (isEdit && currentEmployee) {
      return currentEmployee.schedule
    }
    if (userScheduleQuery.data?.weeklyWorkDays) {
      return userScheduleQuery.data.weeklyWorkDays
    }
    return defaultSchedule
  }

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(isEdit ? employeeEditFormSchema : employeeFormSchema),
    defaultValues: isEdit
      ? {
          name: currentEmployee.name,
          roleIds: currentEmployee.roleIds,
          email: currentEmployee.email,
          password: '',
          birthDate: currentEmployee.birthDate,
          address: currentEmployee.address,
          schedule: currentEmployee.schedule,
        }
      : {
          name: '',
          roleIds: [],
          email: '',
          password: '',
          address: '',
          schedule: getInitialSchedule(),
        },
  })

  // Update form schedule when user schedule data is loaded for new employees
  useEffect(() => {
    if (!isEdit && userScheduleQuery.data?.weeklyWorkDays && open) {
      form.setValue('schedule', userScheduleQuery.data.weeklyWorkDays)
    }
  }, [userScheduleQuery.data, isEdit, open, form])

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

  const onSubmit = async () => {
    if (employeeMutation.isPending || isUploading) {
      return // Prevent double submission
    }
    
    if (photos.length > 0) {
      await handleImageUpload(photos[0])
    }
    employeeMutation.mutate(form.getValues())
  }

  // Función para verificar si ha rellenado algún campo
  const values = form.getValues()
  const hasFilledFields = useCallback(() => {
    const defaultValues = isEdit
      ? {
          name: currentEmployee?.name || '',
          roleIds: currentEmployee?.roleIds || [],
          email: currentEmployee?.email || '',
          password: '',
          birthDate: currentEmployee?.birthDate || '',
          address: currentEmployee?.address || '',
        }
      : {
          name: '',
          roleIds: [],
          email: '',
          password: '',
          address: '',
        }

    // Comparar valores actuales con valores por defecto
    if (values.name !== defaultValues.name) return true
    if (
      JSON.stringify(values.roleIds) !== JSON.stringify(defaultValues.roleIds)
    )
      return true
    if (values.email !== defaultValues.email) return true
    if (values.password !== defaultValues.password) return true
    if (values.address !== defaultValues.address) return true
    if (values.birthDate !== defaultValues.birthDate) return true
    return photos.length > 0
  }, [
    values,
    isEdit,
    currentEmployee?.name,
    currentEmployee?.roleIds,
    currentEmployee?.email,
    currentEmployee?.birthDate,
    currentEmployee?.address,
    photos.length,
  ])

  const isLoadingSchedule = !isEdit && userScheduleQuery.isLoading

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // Prevent closing during API calls
        if (employeeMutation.isPending || isUploading) {
          return
        }
        
        if (!isOpen) {
          // Only check for filled fields when trying to close
          if (hasFilledFields()) {
            // Could add a confirmation dialog here
            const shouldClose = confirm('¿Estás seguro de que deseas cerrar? Se perderán los cambios no guardados.')
            if (!shouldClose) {
              return
            }
          }
          
          // Reset form and close
          form.reset()
          setPhotos([])
          setSelectedTab('employee')
        }
        
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className='sm:max-w-3xl h-[85vh] flex flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle>
            {isEdit ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza la información del empleado aquí.'
              : 'Ingresa la información del nuevo empleado.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 flex flex-col min-h-0'>
          {isLoadingSchedule ? (
            <div className='flex items-center justify-center py-8'>
              <div className='flex items-center gap-3'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary'></div>
                <span className='text-sm text-muted-foreground'>
                  Cargando horario predeterminado...
                </span>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex flex-col flex-1 min-h-0'
                id='employee-form'
              >
                <ScrollArea className='flex-1 w-full pr-4'>
                  <div className='min-h-full flex flex-col p-2'>
                    {isMobile ? (
                      <div className='space-y-4 flex flex-col flex-1'>
                        <EmployeeInfoSection
                          form={form}
                          files={photos}
                          onFilesChange={setPhotos}
                          isEdit={isEdit}
                        />
                        <ScheduleSection form={form} />
                      </div>
                    ) : (
                      <Tabs
                        value={selectedTab}
                        onValueChange={setSelectedTab}
                        className='flex flex-col flex-1'
                      >
                        <div className='flex-shrink-0 mb-4'>
                          <TabsList className='grid w-full grid-cols-2 h-10 p-0.5 bg-muted/30'>
                            <TabsTrigger
                              value='employee'
                              className='flex items-center gap-1.5 h-9 px-3 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm'
                            >
                              <Briefcase className='h-3.5 w-3.5' />
                              Datos del Empleado
                            </TabsTrigger>
                            <TabsTrigger
                              value='schedule'
                              className='flex items-center gap-1.5 h-9 px-3 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm'
                            >
                              <Clock className='h-3.5 w-3.5' />
                              Horario
                            </TabsTrigger>
                          </TabsList>
                        </div>
                        <TabsContent
                          value='employee'
                          className='w-full flex-1 flex flex-col'
                        >
                          <EmployeeInfoSection
                            form={form}
                            files={photos}
                            onFilesChange={setPhotos}
                            isEdit={isEdit}
                          />
                        </TabsContent>
                        <TabsContent
                          value='schedule'
                          className='w-full flex-1 flex flex-col'
                        >
                          <ScheduleSection form={form} />
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </ScrollArea>

                {/* Show form errors if any */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className='flex-shrink-0 px-2 py-3 bg-red-50 border border-red-200 rounded-md'>
                    <div className='text-sm text-red-600'>
                      <p className='font-medium mb-1'>Por favor corrige los siguientes errores:</p>
                      <ul className='list-disc list-inside space-y-1'>
                        {Object.entries(form.formState.errors).map(([field, error]) => (
                          <li key={field}>
                            {field === 'name' && 'Nombre: '}
                            {field === 'email' && 'Email: '}
                            {field === 'password' && 'Contraseña: '}
                            {field === 'roleIds' && 'Roles: '}
                            {field === 'birthDate' && 'Fecha de nacimiento: '}
                            {field === 'address' && 'Dirección: '}
                            {error?.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <DialogFooter className='flex-shrink-0 mt-4 pt-4 border-t bg-background'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => onOpenChange(false)}
                    disabled={employeeMutation.isPending || isUploading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    disabled={employeeMutation.isPending || isUploading || !form.formState.isValid}
                    className='min-w-[120px]'
                  >
                    {employeeMutation.isPending || isUploading
                      ? (
                          <>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            {isEdit ? 'Actualizando...' : 'Creando...'}
                          </>
                        )
                      : isEdit
                        ? 'Actualizar Empleado'
                        : 'Crear Empleado'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

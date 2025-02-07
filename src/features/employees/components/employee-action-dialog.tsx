import React, { useCallback, useRef, useState } from 'react'
import { z } from 'zod'
import { parseISO } from 'date-fns'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Trash2, Upload, X } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'
import { toast } from 'sonner'
import { cn } from '@/lib/utils.ts'
import { useImageUpload } from '@/hooks/use-image-upload.tsx'
import { Button } from '@/components/ui/button'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PasswordInput } from '@/components/password-input'
import { Employee } from '@/features/appointments/types.ts'

// Función auxiliar para convertir una hora en formato "HH:MM" a minutos
const timeStringToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Mapeo de días en inglés a iniciales en español
const dayInitialsMap: Record<string, string> = {
  SUNDAY: 'DO',
  MONDAY: 'LU',
  TUESDAY: 'MA',
  WEDNESDAY: 'MI',
  THURSDAY: 'JU',
  FRIDAY: 'VI',
  SATURDAY: 'SA',
}

// Esquema del formulario usando Zod
const employeeFormSchema = z
  .object({
    name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
    role: z.string().min(1, { message: 'El rol es obligatorio.' }),
    email: z
      .string()
      .min(1, { message: 'El email es obligatorio.' })
      .email({ message: 'El email no es válido.' }),
    birthDate: z.preprocess(
      (arg) => (arg ? parseISO(arg as string) : undefined),
      z.string({ invalid_type_error: 'Fecha no válida' }).optional()
    ),
    address: z.string().optional(),
    photo: z.string().optional(),
    password: z.string(),
    // Usaremos un array para manejar dinámicamente los días de trabajo.
    scheduleEntries: z
      .array(
        z.object({
          day: z.string().min(1, { message: 'El día es obligatorio.' }),
          startAt: z
            .string()
            .min(1, { message: 'La hora de entrada es obligatoria.' }),
          endAt: z
            .string()
            .min(1, { message: 'La hora de salida es obligatoria.' }),
        })
      )
      .min(1, { message: 'Debe haber al menos un día en el horario.' }),
    isEdit: z.boolean(),
  })
  .superRefine(({ password, isEdit }, ctx) => {
    if (!isEdit && password.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La contraseña es obligatoria.',
        path: ['password'],
      })
    }
  })

export type EmployeeFormType = z.infer<typeof employeeFormSchema>

interface Props {
  currentEmployee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeActionDialog({
  currentEmployee,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentEmployee
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload: (url: string) => console.log('Uploaded image URL:', url),
  })

  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        handleFileChange(fakeEvent)
      }
    },
    [handleFileChange]
  )

  // Función para obtener un horario por defecto con todos los días de la semana
  const defaultScheduleEntries = () => {
    return [
      { day: 'SUNDAY', startAt: '08:00', endAt: '17:00' },
      { day: 'MONDAY', startAt: '08:00', endAt: '17:00' },
      { day: 'TUESDAY', startAt: '08:00', endAt: '17:00' },
      { day: 'WEDNESDAY', startAt: '08:00', endAt: '17:00' },
      { day: 'THURSDAY', startAt: '08:00', endAt: '17:00' },
      { day: 'FRIDAY', startAt: '08:00', endAt: '17:00' },
      { day: 'SATURDAY', startAt: '08:00', endAt: '17:00' },
    ]
  }

  // Si estamos en edición, convertir el schedule (objeto) a un array de entradas con formato "HH:MM"
  const initialScheduleEntries =
    isEdit && currentEmployee?.schedule
      ? Object.entries(currentEmployee.schedule).map(([day, range]) => {
          const pad = (n: number) => n.toString().padStart(2, '0')
          const startAt = `${pad(Math.floor(range.startAt / 60))}:${pad(range.startAt % 60)}`
          const endAt = `${pad(Math.floor(range.endAt / 60))}:${pad(range.endAt % 60)}`
          return { day, startAt, endAt }
        })
      : defaultScheduleEntries()

  const form = useForm<EmployeeFormType>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: isEdit
      ? {
          name: currentEmployee?.name || '',
          role: currentEmployee?.role || '',
          email: currentEmployee?.email || '',
          birthDate: currentEmployee?.birthDate,
          address: currentEmployee?.address || '',
          photo: currentEmployee?.photo || '',
          password: '',
          scheduleEntries: initialScheduleEntries,
          isEdit,
        }
      : {
          name: '',
          role: '',
          email: '',
          birthDate: undefined,
          address: '',
          photo: '',
          password: '',
          scheduleEntries: defaultScheduleEntries(),
          isEdit,
        },
  })

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form

  // Manejo del array de horario
  const { fields, remove } = useFieldArray({
    control,
    name: 'scheduleEntries',
  })

  const onSubmit = (values: EmployeeFormType) => {
    // Transformar el array de scheduleEntries a un objeto con minutos
    const schedule = values.scheduleEntries.reduce<
      Record<string, { startAt: number; endAt: number }>
    >((acc, entry) => {
      acc[entry.day] = {
        startAt: timeStringToMinutes(entry.startAt),
        endAt: timeStringToMinutes(entry.endAt),
      }
      return acc
    }, {})

    const finalValues = {
      ...values,
      schedule,
    }
    reset()
    console.log(finalValues)
    onOpenChange(false)
  }

  const handlePhotoSend = (url: string) => {
    setValue('photo', url)
  }

  // Observar la foto subida para mostrar la vista previa (si se desea)
  const photoUrl = watch('photo')

  // Use react-responsive to determine if we are on a mobile device.
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const firstInputRef = useRef<HTMLInputElement>(null)
  // Render form sections for "Datos del usuario"
  const DatosUsuarioSection = () => (
    <div className='space-y-4'>
      <FormField
        control={control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input
                placeholder='Nombre del empleado'
                {...field}
                autoFocus={true}
              />
            </FormControl>
            <FormMessage>{errors.name?.message}</FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='email'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type='email' placeholder='correo@ejemplo.com' {...field} />
            </FormControl>
            <FormMessage>{errors.email?.message}</FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='password'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Contraseña {isEdit && '(dejar en blanco para no cambiar)'}
            </FormLabel>
            <FormControl>
              <PasswordInput placeholder='Contraseña' {...field} />
            </FormControl>
            <FormMessage>{errors.password?.message}</FormMessage>
          </FormItem>
        )}
      />
    </div>
  )

  // Render form sections for "Datos del empleado"
  const DatosEmpleadoSection = () => (
    <div className='space-y-4'>
      <FormField
        control={control}
        name='role'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rol</FormLabel>
            <FormControl>
              <Input placeholder='Cargo o posición' {...field} />
            </FormControl>
            <FormMessage>{errors.role?.message}</FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Input placeholder='Dirección' {...field} />
            </FormControl>
            <FormMessage>{errors.address?.message}</FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='birthDate'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <FormControl>
              <Input placeholder='01/01/2000' {...field} />
            </FormControl>
            <FormMessage>{errors.birthDate?.message as string}</FormMessage>
          </FormItem>
        )}
      />
      <FormItem>
        <FormLabel>Foto</FormLabel>
        <FormControl>
          <div>
            <div className='w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm'>
              <div className='space-y-2'>
                <h3 className='text-lg font-medium'>Image Upload</h3>
                <p className='text-sm text-muted-foreground'>
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>

              <Input
                type='file'
                accept='image/*'
                className='hidden'
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {!previewUrl ? (
                <div
                  onClick={handleThumbnailClick}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted',
                    isDragging && 'border-primary/50 bg-primary/5'
                  )}
                >
                  <div className='rounded-full bg-background p-3 shadow-sm'>
                    <ImagePlus className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <div className='text-center'>
                    <p className='text-sm font-medium'>Click to select</p>
                    <p className='text-xs text-muted-foreground'>
                      or drag and drop file here
                    </p>
                  </div>
                </div>
              ) : (
                <div className='relative'>
                  <div className='group relative h-64 overflow-hidden rounded-lg border'>
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                    <div className='absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100' />
                    <div className='absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={handleThumbnailClick}
                        className='h-9 w-9 p-0'
                      >
                        <Upload className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={handleRemove}
                        className='h-9 w-9 p-0'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  {fileName && (
                    <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
                      <span className='truncate'>{fileName}</span>
                      <button
                        onClick={handleRemove}
                        className='ml-auto rounded-full p-1 hover:bg-muted'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </FormControl>
        <FormMessage>{errors.photo?.message}</FormMessage>
      </FormItem>
    </div>
  )

  // Render form sections for "Horario de trabajo"
  const HorarioSection = () => (
    <div className='space-y-4'>
      <fieldset className='border p-4 rounded'>
        <legend className='px-2 text-lg font-semibold'>
          Horario de trabajo
        </legend>
        <div className='flex flex-col gap-4'>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='flex flex-col sm:flex-row items-center gap-4 border-b pb-2'
            >
              <div className='w-12 text-center font-bold'>
                {dayInitialsMap[field.day] || field.day}
              </div>
              <div className='flex-1'>
                <FormField
                  control={control}
                  name={`scheduleEntries.${index}.startAt` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>Entrada</FormLabel>
                      <Input type='time' {...field} />
                      <FormMessage>
                        {errors.scheduleEntries &&
                          errors.scheduleEntries[index]?.startAt?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex-1'>
                <FormField
                  control={control}
                  name={`scheduleEntries.${index}.endAt` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>Salida</FormLabel>
                      <Input type='time' {...field} />
                      <FormMessage>
                        {errors.scheduleEntries &&
                          errors.scheduleEntries[index]?.endAt?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <div className='w-20'>
                <Button
                  variant='destructive'
                  onClick={() => {
                    if (fields.length > 1) remove(index)
                    else toast('Debe haber al menos un día de trabajo.')
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )

  return (
    <Dialog modal={true}
      open={open}
      onOpenChange={(state) => {
        reset()
        onOpenChange(state)
      }}
    >
      <DialogContent
        className='sm:max-w-3xl'
        onOpenAutoFocus={(event) => {
          event.preventDefault()
        }}
      >
        <DialogHeader className='text-left'>
          <DialogTitle>
            {isEdit ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza la información del empleado aquí.'
              : 'Ingresa la información del nuevo empleado.'}{' '}
            Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh] w-full pr-4 -mr-4 py-1'>
          <Form {...form}>
            <form
              id='employee-form'
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              {/* Conditionally render Tabs for desktop, or a vertical layout for mobile */}
              {isMobile ? (
                <div className='space-y-8'>
                  <section>
                    <h3 className='text-xl font-semibold mb-2'>
                      Datos del usuario
                    </h3>
                    <DatosUsuarioSection />
                  </section>
                  <section>
                    <h3 className='text-xl font-semibold mb-2'>
                      Datos del empleado
                    </h3>
                    <DatosEmpleadoSection />
                  </section>
                  <section>
                    <h3 className='text-xl font-semibold mb-2'>
                      Horario de trabajo
                    </h3>
                    <HorarioSection />
                  </section>
                </div>
              ) : (
                <Tabs defaultValue='datosUsuario'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='datosUsuario'>
                      Datos del usuario
                    </TabsTrigger>
                    <TabsTrigger value='datosEmpleado'>
                      Datos del empleado
                    </TabsTrigger>
                    <TabsTrigger value='horario'>
                      Horario de trabajo
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='datosUsuario' className='space-y-4'>
                    <DatosUsuarioSection />
                  </TabsContent>
                  <TabsContent value='datosEmpleado' className='space-y-4'>
                    <DatosEmpleadoSection />
                  </TabsContent>
                  <TabsContent value='horario' className='space-y-4'>
                    <HorarioSection />
                  </TabsContent>
                </Tabs>
              )}
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button type='submit' form='employee-form'>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

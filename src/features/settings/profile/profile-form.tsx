import { useForm } from 'react-hook-form'
import {
  Form,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Edit, Save, Clock } from 'lucide-react'
import { ProfileService, ScheduleService } from '@/features/settings/profile/ProfileService.ts'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UpdateBusinessScheduleRequest, WeekDay, WorkDay } from '@/features/settings/profile/types.ts'
import { useUploadMedia } from '@/features/chats/hooks/useUploadMedia.ts'
import { toast } from 'sonner';
import SocialMediaSection from '@/features/settings/profile/SocialMediaSection.tsx'
import PlanDetailsSection from '@/features/settings/profile/PlanDetailsSection.tsx'
import ProfileHeader from '@/features/settings/profile/ProfileHeader.tsx'

export default function ProfileForm() {
  const form = useForm({
    mode: 'onChange',
  })

  // Query para obtener los datos del usuario
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: ProfileService.getMe,
  })

  const [isPlanExpanded, setIsPlanExpanded] = useState(false)
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true)
  const [isSocialMediaExpanded, setIsSocialMediaExpanded] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [isAddingNonWorkDate, setIsAddingNonWorkDate] = useState(false)

  // Datos de edición de horario
  const [editWorkDays, setEditWorkDays] = useState<Partial<Record<WeekDay, WorkDay>>>({})
  const [editNonWorkDates, setEditNonWorkDates] = useState<Array<{
    date: string;
    reason: string;
    recurrent: boolean;
  }>>([])
  const [newNonWorkDate, setNewNonWorkDate] = useState({
    date: '',
    reason: '',
    recurrent: false
  })

  const queryClient = useQueryClient()

  const {data: schedule } = useQuery({
    queryKey: ['schedule'],
    queryFn: ScheduleService.getSchedule,
  })

  // Mutación para actualizar el horario
  const updateScheduleMutation = useMutation({
    mutationFn: ScheduleService.updateSchedule,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      await setIsEditingSchedule(false)
      toast.success('Horario actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el horario');
    },
  })

  // Inicializar datos de edición cuando se carga el horario
  useEffect(() => {
    if (schedule) {
      setEditWorkDays({...schedule.weeklyWorkDays})
      setEditNonWorkDates([...schedule.nonWorkDates])
    }
  }, [schedule])

  // Función para convertir horas y minutos a minutos totales
  const timeToMinutes = (hours: number, minutes: number): number => {
    return hours * 60 + minutes
  }

  // Función para manejar cambios en los días laborables
  const handleWorkDayChange = (day: WeekDay, field: 'startAt' | 'endAt', hours: number, minutes: number) => {
    const minutes_total = timeToMinutes(hours, minutes)

    setEditWorkDays(prev => {
      const current = prev[day] || { startAt: 540, endAt: 1080 }
      return {
        ...prev,
        [day]: {
          ...current,
          [field]: minutes_total
        }
      }
    })
  }

  // Función para agregar o quitar un día de trabajo
  const toggleWorkDay = (day: WeekDay, active: boolean) => {
    setEditWorkDays(prev => {
      const newWorkDays = {...prev}
      if (active) {
        newWorkDays[day] = { startAt: 540, endAt: 1080 } // 9:00 AM - 6:00 PM por defecto
      } else {
        delete newWorkDays[day]
      }
      return newWorkDays
    })
  }

  // Función para añadir una nueva fecha no laborable
  const addNonWorkDate = () => {
    if (newNonWorkDate.date && newNonWorkDate.reason) {
      setEditNonWorkDates(prev => [...prev, {...newNonWorkDate}])
      setNewNonWorkDate({
        date: '',
        reason: '',
        recurrent: false
      })
      setIsAddingNonWorkDate(false)
    }
  }

  // Función para eliminar una fecha no laborable
  const removeNonWorkDate = (index: number) => {
    setEditNonWorkDates(prev => prev.filter((_, i) => i !== index))
  }

  // Función para guardar los cambios del horario
  const saveScheduleChanges = async () => {
    const updateData: UpdateBusinessScheduleRequest = {
      weeklyWorkDays: editWorkDays,
      nonWorkDates: editNonWorkDates
    }

    await updateScheduleMutation.mutateAsync(updateData)
  }

  // Hook para manejar la carga de imágenes
  const { uploadFile, isUploading } = useUploadMedia();

  // Estado para controlar la edición del perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Mutación para actualizar el perfil
  const updateProfileMutation = useMutation({
    mutationFn: ProfileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditingProfile(false); // Salir del modo edición después de guardar
      toast.success('Perfil actualizado correctamente'); // Mensaje de éxito
    },
    onError: () => {
      toast.error('Error al actualizar el perfil'); // Mensaje de error (opcional)
    },
  });

  // Función para manejar la carga de la foto de perfil
  const handleLogoUpload = async (file: File) => {
    try {
      const url = await uploadFile(file);
      form.setValue('logo', url); // Actualizar el valor del campo logo
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
    }
  };

  // Función para guardar cambios del perfil
  const saveProfileChanges = async () => {
    const updatedData = form.getValues();
    await updateProfileMutation.mutateAsync(updatedData);
  };

  return (
    <Form {...form}>
      <div className="space-y-8">
        <ProfileHeader
          user={user}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          form={form}
          handleLogoUpload={handleLogoUpload}
          saveProfileChanges={saveProfileChanges}
          isUploading={isUploading}
        />

        {/* Business Schedule Section */}
        <div className="space-y-4">
          {/* Header with toggle button and edit button */}
          <div className="flex items-center justify-between cursor-pointer">
            <div
              className="flex items-center space-x-2"
              onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
            >
              <h3 className="text-lg font-medium">Horario de Trabajo</h3>
              {isScheduleExpanded ?
                <ChevronUp className="h-5 w-5 text-gray-500" /> :
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </div>
            {isScheduleExpanded && (
              isEditingSchedule ? (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Resetear al estado original y cancelar edición
                      if (schedule) {
                        setEditWorkDays({...schedule.weeklyWorkDays})
                        setEditNonWorkDates([...schedule.nonWorkDates])
                      }
                      setIsEditingSchedule(false)
                      setIsAddingNonWorkDate(false)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={saveScheduleChanges}
                    disabled={updateScheduleMutation.isPending}
                  >
                    {updateScheduleMutation.isPending ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" /> Guardar
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingSchedule(true)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              )
            )}
          </div>

          {isScheduleExpanded && (
            <div className="space-y-4">
              {/* Work Days */}
              <div className="space-y-2">
                <FormLabel>Días laborables</FormLabel>
                {isEditingSchedule ? (
                  <div className="space-y-4">
                    {/* Editable work days */}
                    {(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as WeekDay[]).map((day) => {
                      const isWorkDay = Boolean(editWorkDays[day])
                      const workDay = editWorkDays[day] || { startAt: 540, endAt: 1080 }
                      const startHours = Math.floor(workDay.startAt / 60)
                      const startMinutes = workDay.startAt % 60
                      const endHours = Math.floor(workDay.endAt / 60)
                      const endMinutes = workDay.endAt % 60

                      return (
                        <div key={day} className="flex items-start space-x-3 border p-3 rounded-md">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id={`workday-${day}`}
                              checked={isWorkDay}
                              onCheckedChange={(checked) => {
                                toggleWorkDay(day, checked as boolean)
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={`workday-${day}`}
                                className="font-medium text-sm"
                              >
                                {formatDay(day)}
                              </label>
                            </div>
                          </div>

                          {isWorkDay && (
                            <div className="flex flex-1 items-center space-x-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                <div className="flex items-center space-x-1">
                                  <Select
                                    value={startHours.toString()}
                                    onValueChange={(value) => {
                                      handleWorkDayChange(day, 'startAt', parseInt(value), startMinutes)
                                    }}
                                  >
                                    <SelectTrigger className="w-16">
                                      <SelectValue placeholder="Hora" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({length: 24}, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i.toString().padStart(2, '0')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span>:</span>
                                  <Select
                                    value={startMinutes.toString()}
                                    onValueChange={(value) => {
                                      handleWorkDayChange(day, 'startAt', startHours, parseInt(value))
                                    }}
                                  >
                                    <SelectTrigger className="w-16">
                                      <SelectValue placeholder="Min" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[0, 15, 30, 45].map((min) => (
                                        <SelectItem key={min} value={min.toString()}>
                                          {min.toString().padStart(2, '0')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <span>a</span>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                <div className="flex items-center space-x-1">
                                  <Select
                                    value={endHours.toString()}
                                    onValueChange={(value) => {
                                      handleWorkDayChange(day, 'endAt', parseInt(value), endMinutes)
                                    }}
                                  >
                                    <SelectTrigger className="w-16">
                                      <SelectValue placeholder="Hora" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({length: 24}, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i.toString().padStart(2, '0')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span>:</span>
                                  <Select
                                    value={endMinutes.toString()}
                                    onValueChange={(value) => {
                                      handleWorkDayChange(day, 'endAt', endHours, parseInt(value))
                                    }}
                                  >
                                    <SelectTrigger className="w-16">
                                      <SelectValue placeholder="Min" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[0, 15, 30, 45].map((min) => (
                                        <SelectItem key={min} value={min.toString()}>
                                          {min.toString().padStart(2, '0')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {schedule && Object.entries(schedule.weeklyWorkDays).map(([day, hours]) => (
                      <div key={day} className="border p-3 rounded-md">
                        <p className="font-medium">{formatDay(day)}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(hours.startAt)} - {formatTime(hours.endAt)}
                        </p>
                      </div>
                    ))}
                    {(!schedule || Object.keys(schedule.weeklyWorkDays).length === 0) && (
                      <p className="text-sm text-gray-500">No hay días laborables configurados</p>
                    )}
                  </div>
                )}
              </div>

              {/* Non-Working Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Días no laborables</FormLabel>
                  {isEditingSchedule && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingNonWorkDate(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                  )}
                </div>

                {isEditingSchedule ? (
                  <div className="space-y-3">
                    {editNonWorkDates.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editNonWorkDates.map((nonWorkDate, index) => (
                          <div key={index} className="border p-3 rounded-md flex justify-between items-start">
                            <div>
                              <p className="font-medium">{new Date(nonWorkDate.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-600">{nonWorkDate.reason}</p>
                              {nonWorkDate.recurrent && (
                                <p className="text-xs text-blue-600">Recurrente cada año</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removeNonWorkDate(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay días no laborables configurados</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {schedule && schedule.nonWorkDates && schedule.nonWorkDates.length > 0 ? (
                      schedule.nonWorkDates.map((nonWorkDate, index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <p className="font-medium">{new Date(nonWorkDate.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{nonWorkDate.reason}</p>
                          {nonWorkDate.recurrent && (
                            <p className="text-xs text-blue-600">Recurrente cada año</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay días no laborables configurados</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diálogo para añadir día no laborable */}
        <Dialog open={isAddingNonWorkDate} onOpenChange={setIsAddingNonWorkDate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar día no laborable</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <FormLabel htmlFor="non-work-date">Fecha</FormLabel>
                <Input
                  id="non-work-date"
                  type="date"
                  value={newNonWorkDate.date}
                  onChange={(e) => setNewNonWorkDate({...newNonWorkDate, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <FormLabel htmlFor="non-work-reason">Motivo</FormLabel>
                <Input
                  id="non-work-reason"
                  value={newNonWorkDate.reason}
                  onChange={(e) => setNewNonWorkDate({...newNonWorkDate, reason: e.target.value})}
                  placeholder="Ej: Navidad, Día festivo, etc."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="non-work-recurrent"
                  checked={newNonWorkDate.recurrent}
                  onCheckedChange={(checked) =>
                    setNewNonWorkDate({...newNonWorkDate, recurrent: checked as boolean})
                  }
                />
                <label
                  htmlFor="non-work-recurrent"
                  className="text-sm font-medium leading-none"
                >
                  Repetir cada año
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingNonWorkDate(false)}>
                Cancelar
              </Button>
              <Button
                onClick={addNonWorkDate}
                disabled={!newNonWorkDate.date || !newNonWorkDate.reason}
              >
                Agregar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* Sección de Detalles del Plan */}
        <PlanDetailsSection
          user={user}
          isPlanExpanded={isPlanExpanded}
          setIsPlanExpanded={setIsPlanExpanded}
        />

        {/* Sección de Redes Sociales */}
        <SocialMediaSection
          user={user}
          isSocialMediaExpanded={isSocialMediaExpanded}
          setIsSocialMediaExpanded={setIsSocialMediaExpanded}
        />
      </div>
    </Form>
  )
}

// Función para formatear el día de la semana
function formatDay(day: string): string {
  const dayMap: Record<string, string> = {
    'MONDAY': 'Lunes',
    'TUESDAY': 'Martes',
    'WEDNESDAY': 'Miércoles',
    'THURSDAY': 'Jueves',
    'FRIDAY': 'Viernes',
    'SATURDAY': 'Sábado',
    'SUNDAY': 'Domingo',
  }
  return dayMap[day] || day
}

// Función para formatear los minutos a formato hora (HH:MM)
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
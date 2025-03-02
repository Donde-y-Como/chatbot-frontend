import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { now } from '@internationalized/date'
import { es } from 'date-fns/locale/es'
import { Calendar as CalendarIcon, Clock, User, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import {
  Appointment,
  EmployeeAvailable,
  MinutesTimeRange,
} from '@/features/appointments/types.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { CheckCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MakeAppointmentDialog() {
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState<Date>(now('America/Mexico_City').toDate())
  const [availableSlots, setAvailableSlots] = useState<
    { slot: MinutesTimeRange; employees: EmployeeAvailable[] }[]
  >([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [employeeId, setEmployeeId] = useState('')
  const [loading, setLoading] = useState(false)
  const { data: clients } = useGetClients()
  const { data: services } = useGetServices()
  const queryClient = useQueryClient()

  // Reset slot and employee when date or service changes
  useEffect(() => {
    setSelectedSlot(null)
    setEmployeeId('')
    setAvailableSlots([])
  }, [date, serviceId])

  // Fetch availability when date and service are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !serviceId) return
      setLoading(true)

      try {
        const formattedDate = format(date, 'yyyy-MM-dd')
        const response = await api.get(
          `/appointments/availability?givenDate=${formattedDate}&serviceId=${serviceId}`
        )
        setAvailableSlots(response.data.availableSlots)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (date && serviceId) {
      fetchAvailability()
    }
  }, [date, serviceId])

  // Update active step based on selections
  useEffect(() => {
    if (!clientId || !serviceId) {
      setActiveStep(1)
    } else if (!selectedSlot) {
      setActiveStep(2)
    } else if (!employeeId) {
      setActiveStep(3)
    } else {
      setActiveStep(4)
    }
  }, [clientId, serviceId, selectedSlot, employeeId])

  const resetForm = () => {
    setClientId('')
    setServiceId('')
    setSelectedSlot(null)
    setEmployeeId('')
    setAvailableSlots([])
    setActiveStep(1)
  }

  const handleSubmit = async () => {
    if (!clientId || !serviceId || !selectedSlot || !employeeId) {
      toast.error('Por favor, completa todos los campos')
      return
    }

    setLoading(true)

    const appointmentData = {
      clientId,
      serviceId,
      employeeId,
      date: format(date, 'yyyy-MM-dd'),
      timeRange: JSON.parse(selectedSlot) satisfies MinutesTimeRange,
      notes: '',
    } satisfies Partial<Appointment>

    try {
      const result = await appointmentService.makeAppointment(appointmentData)
      if (result.id) {
        void queryClient.invalidateQueries({
          queryKey: [
            'appointments',
            format(date, 'yyyy-MM-dd'),
            format(date, 'yyyy-MM-dd'),
          ],
        })
        toast.success('Cita agendada con éxito')
        resetForm()
        setLoading(false)
        setOpen(false)
      } else {
        toast.error('Error al agendar la cita')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  // Get selected client and service objects
  const selectedClient = clients?.find(client => client.id === clientId)
  const selectedService = services?.find(service => service.id === serviceId)
  
  // Get employees for selected slot
  const slotEmployees = selectedSlot 
    ? availableSlots.find(s => JSON.stringify(s.slot) === selectedSlot)?.employees || []
    : []
  
  // Get selected employee
  const selectedEmployee = slotEmployees.find(emp => emp.id === employeeId)

  // Format slot time for display
  const selectedSlotTime = selectedSlot 
    ? `${formatSlotHour(JSON.parse(selectedSlot).startAt)} - ${formatSlotHour(JSON.parse(selectedSlot).endAt)}`
    : null

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 transition-all duration-300">
          Agendar Cita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Agendar Cita</DialogTitle>
          <DialogDescription>
            Complete los siguientes pasos para agendar su cita
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {/* Progress indicator */}
          <div className="w-full mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={cn(
                    "flex flex-col items-center",
                    { "text-primary": step <= activeStep },
                    { "text-muted-foreground": step > activeStep }
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white mb-1",
                    { "bg-primary": step <= activeStep },
                    { "bg-muted": step > activeStep }
                  )}>
                    {step < activeStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">
                    {step === 1 && "Información"}
                    {step === 2 && "Fecha y Hora"}
                    {step === 3 && "Empleado"}
                    {step === 4 && "Confirmación"}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(activeStep / 4) * 100}%` }}
              />
            </div>
          </div>

          <Tabs defaultValue="1" value={activeStep.toString()}>
            {/* Step 1: Client and Service Selection */}
            <TabsContent value="1" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Cliente</label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id} className="py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={client.photo} alt={client.name} className="object-cover"/>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{client.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Servicio</label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                disabled={!clientId || !serviceId}
                onClick={() => setActiveStep(2)}
              >
                Continuar
              </Button>
            </TabsContent>

            {/* Step 2: Date and Time Selection */}
            <TabsContent value="2" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha</label>
                  <div className="border rounded-md p-1">
                    <Calendar
                      required
                      locale={es}
                      mode="single"
                      selected={date}
                      onSelect={(d) => setDate(d as Date)}
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Horarios Disponibles {loading && "(Cargando...)"}
                  </label>
                  <ScrollArea className="h-64 border rounded-md p-2">
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.slot.startAt}
                            variant={selectedSlot === JSON.stringify(slot.slot) ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setSelectedSlot(JSON.stringify(slot.slot))}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {formatSlotHour(slot.slot.startAt)} - {formatSlotHour(slot.slot.endAt)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Clock className="h-8 w-8 mb-2" />
                        <p className="text-center">
                          {loading 
                            ? "Cargando horarios disponibles..." 
                            : date && serviceId 
                              ? "No hay horarios disponibles para esta fecha" 
                              : "Selecciona una fecha y servicio para ver horarios disponibles"
                          }
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <div className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={() => setActiveStep(1)}>
                  Atrás
                </Button>
                <Button 
                  disabled={!selectedSlot || loading}
                  onClick={() => setActiveStep(3)}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Employee Selection */}
            <TabsContent value="3" className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Empleado</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slotEmployees.map((employee) => (
                  <Card 
                    key={employee.id} 
                    className={cn(
                      "cursor-pointer hover:border-primary transition-all",
                      { "border-primary bg-primary/5": employeeId === employee.id }
                    )}
                    onClick={() => setEmployeeId(employee.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={employee.photo} alt={employee.name} className="object-cover"/>
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">Empleado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={() => setActiveStep(2)}>
                  Atrás
                </Button>
                <Button 
                  disabled={!employeeId || loading}
                  onClick={() => setActiveStep(4)}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Confirmation */}
            <TabsContent value="4" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resumen de la Cita</CardTitle>
                  <CardDescription>Verifica los detalles de tu cita</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <div className="flex items-center gap-2">
                        {selectedClient && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedClient.photo} alt={selectedClient.name} className='object-cover'/>
                            <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <p className="font-medium">{selectedClient?.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Servicio</p>
                      <p className="font-medium">{selectedService?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                      <p className="font-medium">
                        {format(date, 'PPPP', { locale: es })} • {selectedSlotTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Empleado</p>
                      <div className="flex items-center gap-2">
                        {selectedEmployee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedEmployee.photo} alt={selectedEmployee.name} className='object-cover' />
                            <AvatarFallback>{selectedEmployee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <p className="font-medium">{selectedEmployee?.name}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={() => setActiveStep(3)}>
                  Atrás
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Procesando...' : 'Confirmar Cita'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatSlotHour(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  // Determine period (AM/PM)
  const period = hours < 12 ? 'AM' : 'PM'

  // Convert to 12-hour format
  const displayHours =
    hours === 0
      ? 12 // Midnight
      : hours > 12
        ? hours - 12 // PM
        : hours // AM

  // Format minutes with leading zero if needed
  const displayMinutes = mins.toString().padStart(2, '0')

  // Return formatted time
  return `${displayHours}:${displayMinutes} ${period}`
}
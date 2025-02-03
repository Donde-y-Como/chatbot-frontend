import { useState } from 'react'
import { format, setMinutes } from 'date-fns'
import { Plus } from 'lucide-react'
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
import { Appointment, EmployeeAvailable, MinutesTimeRange } from '@/features/appointments/types.ts'
import { es } from 'date-fns/locale/es'
import { useQueryClient } from '@tanstack/react-query'

export function MakeAppointmentDialog() {
  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [availableSlots, setAvailableSlots] = useState<
    { slot: MinutesTimeRange, employees: EmployeeAvailable[] }[]
  >([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [employeeId, setEmployeeId] = useState('')

  const { data: clients } = useGetClients()
  const { data: services } = useGetServices()
  const queryClient = useQueryClient()

  const fetchAvailability = async () => {
    if (!date || !serviceId) return

    const formattedDate = format(date, 'yyyy-MM-dd')
    const response = await api.get(
      `/appointments/availability?givenDate=${formattedDate}&serviceId=${serviceId}`
    )
    setAvailableSlots(response.data.availableSlots)
  }

  const handleSubmit = async () => {
    if (!clientId || !serviceId || !selectedSlot || !employeeId) {
      toast.error('Por favor, completa todos los campos')
      return
    }

    const appointmentData = {
      clientId,
      serviceId,
      employeeId,
      date: date!,
      timeRange: JSON.parse(selectedSlot) satisfies MinutesTimeRange,
      notes: '',
    } satisfies Partial<Appointment>

    try {
      const result = await appointmentService.makeAppointment(appointmentData)
      if (result.id) {
        void queryClient.invalidateQueries({
          queryKey: ['appointments', format(date, 'yyyy-MM-dd'), format(date, 'yyyy-MM-dd')],
        })
        toast.success('Cita agendada con éxito')
        setEmployeeId('')
        setClientId('')
        setServiceId('')
        setAvailableSlots([])
        setSelectedSlot(null)
        setOpen(false)
      } else {
        toast.error('Error al agendar la cita')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-full bg-primary hover:bg-primary/90 transition-all duration-300'>
          <Plus className='mr-2 h-4 w-4 animate-pulse' /> Agendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogDescription className='sr-only'>Agendar cita</DialogDescription>
        <DialogHeader>
          <DialogTitle>Agendar cita</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <Select onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder='Selecciona un cliente' />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.profileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setServiceId}>
            <SelectTrigger>
              <SelectValue placeholder='Selecciona un servicio' />
            </SelectTrigger>
            <SelectContent>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Calendar
            required
            locale={es}
            mode='single'
            selected={date}
            onSelect={(d)=>setDate(d as Date)}
          />
          <Button onClick={fetchAvailability}>Consultar disponibilidad</Button>

          {availableSlots.length > 0 && (
            <Select onValueChange={setSelectedSlot}>
              <SelectTrigger>
                <SelectValue placeholder='Selecciona un horario' />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem
                    key={slot.slot.startAt}
                    value={JSON.stringify(slot.slot)}
                  >
                    {format(setMinutes(new Date(), slot.slot.startAt), 'HH:mm')} - {format(setMinutes(new Date(), slot.slot.endAt), 'HH:mm')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedSlot && (
            <Select onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder='Selecciona un empleado' />
              </SelectTrigger>
              <SelectContent>
                {availableSlots
                  .find((s) => JSON.stringify(s.slot) === selectedSlot)
                  ?.employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

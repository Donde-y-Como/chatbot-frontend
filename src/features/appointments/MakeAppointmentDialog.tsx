import { useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { now } from '@internationalized/date'
import { es } from 'date-fns/locale/es'
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
import {
  Appointment,
  EmployeeAvailable,
  MinutesTimeRange,
} from '@/features/appointments/types.ts'

export function MakeAppointmentDialog() {
  const [open, setOpen] = useState(false)
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

  const fetchAvailability = async () => {
    if (!date || !serviceId) return
    setLoading(true)

    const formattedDate = format(date, 'yyyy-MM-dd')
    const response = await api.get(
      `/appointments/availability?givenDate=${formattedDate}&serviceId=${serviceId}`
    )
    setAvailableSlots(response.data.availableSlots)
    setLoading(false)
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
      date: format(date!, 'yyyy-MM-dd'),
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
        setEmployeeId('')
        setClientId('')
        setServiceId('')
        setAvailableSlots([])
        setSelectedSlot(null)
        setLoading(false)
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
                  {client.name}
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
            onSelect={(d) => setDate(d as Date)}
          />
          <Button disabled={loading || !serviceId} onClick={fetchAvailability}>
            Consultar disponibilidad
          </Button>

          {availableSlots.length > 0 ? (
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
                    {formatSlotHour(slot.slot.startAt)} -{' '}
                    {formatSlotHour(slot.slot.endAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <h4 className='text-center font-light text-sm'>
              No hay horarios disponibles para este día
            </h4>
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
          <Button disabled={loading} onClick={handleSubmit}>
            Agendar
          </Button>
        </DialogFooter>
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
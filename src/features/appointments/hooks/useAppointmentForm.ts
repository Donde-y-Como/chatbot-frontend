import { useEffect, useMemo, useState } from 'react'
import { getHours, getMinutes } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { Appointment, MinutesTimeRange, AppointmentStatus, PaymentStatus, Deposit, ConsumableUsage } from '@/features/appointments/types.ts'
import { isValidAppointmentDate, getPastDateErrorMessage, canChangeDateTo } from '@/features/appointments/utils/formatters'
import { useCheckAvailability } from './useCheckAvailability'

export function useAppointmentForm(
  defaultClientName?: string,
  onSuccess?: () => void,
  appointment?: Appointment,
  defaultDate?: Date, // Fecha prellenada (desde calendario)
  defaultTimeRange?: MinutesTimeRange, // Hora prellenada (desde clic en hora)
  defaultServiceIds?: string[], // Servicios pre-seleccionados
  onAppointmentCreated?: (appointmentId: string) => void // Callback cuando se crea la cita
) {
  const [activeStep, setActiveStep] = useState(1)
  const [clientId, setClientId] = useState(
    appointment ? appointment.clientId : ''
  )
  const [serviceIds, setServiceIds] = useState<string[]>(
    appointment ? appointment.serviceIds : (defaultServiceIds || [])
  )
  const [date, setDate] = useState<Date>(
    appointment ? new Date(appointment.date) : (defaultDate || new Date())
  )
  const [timeRange, setTimeRange] = useState<MinutesTimeRange>(
    appointment
      ? appointment.timeRange
      : defaultTimeRange || {
          startAt: 540, // 9:00 AM por defecto
          endAt: 600,   // 10:00 AM por defecto
        }
  )

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    appointment?.employeeIds || []
  )
  
  // Nuevos estados para estados y pago
  const [status, setStatus] = useState<AppointmentStatus>(
    appointment?.status || 'pendiente'
  )
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    appointment?.paymentStatus || 'pendiente'
  )
  const [deposit, setDeposit] = useState<Deposit | null>(
    appointment?.deposit || null
  )
  const [notes, setNotes] = useState<string>(
    appointment?.notes || ''
  )
  
  // Nuevos estados para equipos y consumibles
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    appointment?.equipmentIds || []
  )
  const [consumableUsages, setConsumableUsages] = useState<ConsumableUsage[]>(
    appointment?.consumableUsages || []
  )
  
  const [loading, setLoading] = useState(false)
  const { data: clients } = useGetClients()
  
  // Si se proporciona defaultClientName, buscar el cliente por nombre al cargar clientes
  useEffect(() => {
    if (defaultClientName && clients && clients.length > 0 && !clientId) {
      // Buscar cliente por nombre
      const matchingClient = clients.find(client => 
        client.name && client.name.toLowerCase().includes(defaultClientName.toLowerCase())
      )
      
      if (matchingClient) {
        setClientId(matchingClient.id)
      }
    }
  }, [clients, defaultClientName, clientId])

  // Update serviceIds when defaultServiceIds changes (for preselection)
  useEffect(() => {
    if (!appointment) {
      if (defaultServiceIds && defaultServiceIds.length > 0) {
        setServiceIds(defaultServiceIds)
      } else if (defaultServiceIds && defaultServiceIds.length === 0) {
        // Handle case where we explicitly want to clear selections
        setServiceIds([])
      }
    }
  }, [defaultServiceIds, appointment])
  
  const { data: services } = useGetServices()
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchServiceDuration = () => {
      if (appointment) {
        setTimeRange(appointment.timeRange)
        return
      }

      // Si hay defaultTimeRange y no hay servicios seleccionados, respetarlo
      if (defaultTimeRange && serviceIds.length === 0) {
        setTimeRange(defaultTimeRange)
        return
      }

      const currentStartAt = defaultTimeRange?.startAt || (getMinutes(date) + getHours(date) * 60)
      let endAt = currentStartAt

      if (services && serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          const service = services.find((service) => service.id === serviceId)

          if (!service) continue

          const durationInMinutes =
            service.duration.value *
            (service.duration.unit === 'minutes' ? 1 : 60)

          endAt += durationInMinutes
        }

        setTimeRange({
          startAt: currentStartAt,
          endAt,
        })

        return
      }

      // Si no hay servicios, usar defaultTimeRange o calcular por defecto
      if (defaultTimeRange) {
        setTimeRange(defaultTimeRange)
      } else {
        setTimeRange({
          startAt: currentStartAt,
          endAt: currentStartAt + 60,
        })
      }
    }

    fetchServiceDuration()
  }, [services, serviceIds, appointment, date, defaultTimeRange])

  useEffect(() => {
    let endAt = timeRange.startAt

    if (services && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        const service = services.find((service) => service.id === serviceId)

        if (!service) continue

        const durationInMinutes =
          service.duration.value *
          (service.duration.unit === 'minutes' ? 1 : 60)

        endAt += durationInMinutes
      }

      setTimeRange((prev) => ({
        ...prev,
        endAt,
      }))
    }
  }, [timeRange.startAt, services, serviceIds])

  useEffect(() => {
    if (!clientId || serviceIds.length === 0) {
      setActiveStep(1)
    }
  }, [clientId, serviceIds])

  const resetForm = () => {
    if (appointment) {
      setClientId(appointment.clientId)
      setServiceIds(appointment.serviceIds)
      setTimeRange(appointment.timeRange)
      setSelectedEmployeeIds(appointment.employeeIds)
      setDate(new Date(appointment.date))
      setStatus(appointment.status || 'pendiente')
      setPaymentStatus(appointment.paymentStatus || 'pendiente')
      setDeposit(appointment.deposit || null)
      setNotes(appointment.notes || '')
      setSelectedEquipmentIds(appointment.equipmentIds || [])
      setConsumableUsages(appointment.consumableUsages || [])
    } else {
      setClientId('')
      setServiceIds([])
      // Solo usar defaultTimeRange si fue proporcionado, sino usar valores por defecto
      if (defaultTimeRange) {
        setTimeRange(defaultTimeRange)
      } else {
        setTimeRange({
          startAt: 540, // 9:00 AM
          endAt: 600,   // 10:00 AM
        })
      }
      setSelectedEmployeeIds([])
      setDate(defaultDate || new Date())
      setStatus('pendiente')
      setPaymentStatus('pendiente')
      setDeposit(null)
      setNotes('')
      setSelectedEquipmentIds([])
      setConsumableUsages([])
    }

    setActiveStep(1)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!clientId || serviceIds.length === 0 || !timeRange) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    if (!isValidAppointmentDate(date)) {
      toast.error(getPastDateErrorMessage())
      return
    }

    // Si estamos editando, validar que se pueda cambiar la fecha
    if (appointment && !canChangeDateTo(new Date(appointment.date), date)) {
      toast.error('No se puede cambiar la cita a una fecha pasada')
      return
    }

    setLoading(true)

    const appointmentData = {
      clientId,
      serviceIds,
      employeeIds: selectedEmployeeIds,
      date: date.toUTCString(),
      timeRange,
      notes,
      // Nuevos campos
      status,
      paymentStatus,
      deposit,
      equipmentIds: selectedEquipmentIds,
      consumableUsages,
    } satisfies Partial<Appointment>

    try {
      const result = appointment
        ? await appointmentService.editAppointment(
            appointment.id,
            appointmentData
          )
        : await appointmentService.makeAppointment(appointmentData)

      if (result.id) {
        toast.success(`Cita ${appointment ? 'editada' : 'agendada'} con éxito`)
        resetForm()
        setLoading(false)

        await queryClient.invalidateQueries({
          queryKey: [UseGetAppointmentsQueryKey],
        })

        // Call the appointment created callback if provided (only for new appointments)
        if (!appointment && onAppointmentCreated) {
          onAppointmentCreated(result.id)
        }

        if (onSuccess) onSuccess()
      } else {
        toast.error(`Error al ${appointment ? 'editar' : 'agendar'} la cita`)
      }
    } catch (error: any) {
      // Manejar errores específicos de fechas pasadas
      if (error?.status === 400) {
        if (error?.detail && (error.detail.includes('cita que ya pasó') || error.detail.includes('fechas pasadas'))) {
          toast.error('No se puede editar una cita que ya pasó')
        } else if (error?.detail && error.detail.includes('fechas pasadas')) {
          toast.error(getPastDateErrorMessage())
        } else {
          toast.error(`Error al ${appointment ? 'editar' : 'agendar'} la cita: ${error.detail || 'Error desconocido'}`)
        }
      } else if (error?.title === 'Cannot edit past appointment' || error?.title === 'Invalid appointment date') {
        toast.error('No se puede agendar una cita en fecha pasada')
      } else {
        toast.error('Error al conectar con el servidor')
      }
      console.error('Error in appointment form:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = useMemo(
    () => clients?.find((client) => client.id === clientId),
    [clients, clientId]
  )

  const selectedServices = useMemo(
    () => services?.filter((service) => serviceIds.includes(service.id)) || [],
    [serviceIds, services]
  )

  const { availableEmployees, loading: loadingEmployees } =
    useCheckAvailability(selectedServices, date, activeStep, timeRange)

  const toggleServiceSelection = (serviceId: string) => {
    setServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((id) => id !== equipmentId)
        : [...prev, equipmentId]
    )
  }

  const updateConsumableUsage = (consumableId: string, quantity: number) => {
    setConsumableUsages((prev) => {
      const existingIndex = prev.findIndex(usage => usage.consumableId === consumableId)
      
      if (quantity === 0) {
        return prev.filter(usage => usage.consumableId !== consumableId)
      }
      
      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = { consumableId, quantity }
        return updated
      } else {
        return [...prev, { consumableId, quantity }]
      }
    })
  }

  const hasFilledFields = () => {
    return clientId !== '' || serviceIds.length > 0
  }

  return {
    activeStep,
    clientId,
    serviceIds,
    date,
    timeRange,
    selectedEmployeeIds,
    loading,
    setSelectedEmployeeIds,

    // Nuevos campos
    status,
    paymentStatus,
    deposit,
    notes,
    setStatus,
    setPaymentStatus,
    setDeposit,
    setNotes,

    // Campos de equipos y consumibles
    selectedEquipmentIds,
    consumableUsages,
    setSelectedEquipmentIds,
    setConsumableUsages,

    clients,
    services,
    selectedClient,
    selectedServices,
    availableEmployees,
    loadingEmployees,

    setActiveStep,
    setClientId,
    setServiceIds,
    toggleServiceSelection,
    setDate,
    setTimeRange,
    toggleEmployeeSelection,
    toggleEquipmentSelection,
    updateConsumableUsage,
    resetForm,
    handleSubmit,
    hasFilledFields,
  }
}

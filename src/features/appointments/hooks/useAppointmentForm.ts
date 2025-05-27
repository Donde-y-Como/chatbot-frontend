import { useEffect, useMemo, useState } from 'react'
import { getHours, getMinutes } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { Appointment, MinutesTimeRange, AppointmentStatus, PaymentStatus, Deposit } from '@/features/appointments/types.ts'
import { useCheckAvailability } from './useCheckAvailability'

export function useAppointmentForm(
  defaultClientName?: string,
  onSuccess?: () => void,
  appointment?: Appointment
) {
  const [activeStep, setActiveStep] = useState(1)
  const [clientId, setClientId] = useState(
    appointment ? appointment.clientId : ''
  )
  const [serviceIds, setServiceIds] = useState<string[]>(
    appointment ? appointment.serviceIds : []
  )
  const [date, setDate] = useState<Date>(
    appointment ? new Date(appointment.date) : new Date()
  )
  const [timeRange, setTimeRange] = useState<MinutesTimeRange>(
    appointment
      ? appointment.timeRange
      : {
          startAt: getMinutes(date),
          endAt: getMinutes(date) + 60,
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
  const { data: services } = useGetServices()
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchServiceDuration = () => {
      if (appointment) {
        setTimeRange(appointment.timeRange)
        return
      }

      const startAt = getMinutes(date) + getHours(date) * 60
      let endAt = startAt

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
          startAt,
          endAt,
        })

        return
      }

      setTimeRange({
        startAt: startAt,
        endAt: startAt + 60,
      })
    }

    fetchServiceDuration()
  }, [services, serviceIds, appointment, date])

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
    } else {
      setClientId('')
      setServiceIds([])
      setTimeRange({
        startAt: 540,
        endAt: 600,
      })
      setSelectedEmployeeIds([])
      setDate(new Date())
      setStatus('pendiente')
      setPaymentStatus('pendiente')
      setDeposit(null)
    }

    setActiveStep(1)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!clientId || serviceIds.length === 0 || !timeRange) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setLoading(true)

    const appointmentData = {
      clientId,
      serviceIds,
      employeeIds: selectedEmployeeIds,
      date: date.toISOString(),
      timeRange,
      notes: appointment ? appointment.notes : '',
      // Nuevos campos
      status,
      paymentStatus,
      deposit,
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

        if (onSuccess) onSuccess()
      } else {
        toast.error(`Error al ${appointment ? 'editar' : 'agendar'} la cita`)
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
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
    useCheckAvailability(selectedServices, date, activeStep)

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
    setStatus,
    setPaymentStatus,
    setDeposit,

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
    resetForm,
    handleSubmit,
    hasFilledFields,
  }
}

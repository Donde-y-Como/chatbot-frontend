import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { useCreateClient } from '@/features/appointments/hooks/useCreateClient.ts'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import {
  Appointment,
  EmployeeAvailable,
  MinutesTimeRange,
} from '@/features/appointments/types.ts'
import { ClientPrimitives } from '@/features/clients/types'

/**
 * Hook containing the state and logic for the appointment creation form
 */
export function useAppointmentForm(
  defaultClientName?: string,
  onSuccess?: () => void
) {
  // State
  const [activeStep, setActiveStep] = useState(1)
  const [clientId, setClientId] = useState('')
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [timeRange, setTimeRange] = useState<MinutesTimeRange>({
    startAt: 540, // Default to 9:00 AM (9 * 60)
    endAt: 600, // Default to 10:00 AM (10 * 60)
  })
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Data fetching
  const { data: clients } = useGetClients()
  const { data: services } = useGetServices()
  const queryClient = useQueryClient()
  const createClientMutation = useCreateClient()

  const createNewClient = useCallback(
    async (name: string) => {
      if (!name.trim()) return

      try {
        const result = await createClientMutation.mutateAsync(name)
        if (result?.id) {
          setClientId(result.id)
          toast.success(`Cliente ${name} creado automáticamente`)
        }
      } catch (error) {
        console.error('Error al crear el cliente:', error)
        toast.error('No se pudo crear el cliente automáticamente')
      }
    },
    [createClientMutation]
  )

  // Update active step based on selections
  useEffect(() => {
    if (!clientId || serviceIds.length === 0) {
      setActiveStep(1)
    } else {
      setActiveStep(2)
    }
  }, [clientId, serviceIds])

  // Handle default client name from props
  useEffect(() => {
    if (defaultClientName && clients) {
      // Find if client exists
      const existingClient = clients.find(
        (client) =>
          client.name.toLowerCase() === defaultClientName.toLowerCase()
      )

      if (existingClient) {
        // If exists, select it
        setClientId(existingClient.id)
      } else {
        // If not, create automatically
        createNewClient(defaultClientName)
      }
    }
  }, [defaultClientName, clients, createNewClient])

  // Setup global window function for opening the dialog from external scripts
  useEffect(() => {
    window.openAppointmentDialog = (clientName?: string) => {
      if (clientName) {
        // Find if client exists
        const existingClient = clients?.find(
          (client) => client.name.toLowerCase() === clientName.toLowerCase()
        )

        if (existingClient) {
          // If exists, select it
          setClientId(existingClient.id)
        } else {
          // If not, create automatically
          createNewClient(clientName)
        }
      }
    }

    return () => {
      delete window.openAppointmentDialog
    }
  }, [clients, createNewClient])

  // Reset form function
  const resetForm = () => {
    setClientId('')
    setServiceIds([])
    setTimeRange({
      startAt: 540,
      endAt: 600,
    })
    setSelectedEmployeeIds([])
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
      notes: '',
    } satisfies Partial<Appointment>

    try {
      const result = await appointmentService.makeAppointment(appointmentData)
      if (result.id) {
        void queryClient.invalidateQueries({
          queryKey: [
            'appointments',
            date.toISOString(),
            date.toISOString(),
          ],
        })
        toast.success('Cita agendada con éxito')
        resetForm()
        setLoading(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error('Error al agendar la cita')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  // Get selected client and services objects
  const selectedClient: ClientPrimitives | undefined = clients?.find(
    (client) => client.id === clientId
  )
  const selectedServices =
    services?.filter((service) => serviceIds.includes(service.id)) || []

  // Get employees for selected services - this would need to be updated in a real implementation
  // For now, we'll set a placeholder until the backend is updated
  const availableEmployees: EmployeeAvailable[] = []

  // Toggle service selection
  const toggleServiceSelection = (serviceId: string) => {
    setServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  // Toggle employee selection
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // Function to determine if fields have been filled
  const hasFilledFields = () => {
    return clientId !== '' || serviceIds.length > 0
  }

  // Return everything needed for the form
  return {
    // State
    activeStep,
    clientId,
    serviceIds,
    date,
    timeRange,
    selectedEmployeeIds,
    loading,

    // Data
    clients,
    services,
    selectedClient,
    selectedServices,
    availableEmployees,

    // Actions
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

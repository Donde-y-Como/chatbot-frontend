import { api } from '@/api/axiosInstance.ts'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { useCreateClient } from '@/features/appointments/hooks/useCreateClient.ts'
import {
  Appointment,
  EmployeeAvailable,
  MinutesTimeRange,
} from '@/features/appointments/types.ts'
import { now } from '@internationalized/date'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState<Date>(now('America/Mexico_City').toDate())
  const [availableSlots, setAvailableSlots] = useState<
    { slot: MinutesTimeRange; employees: EmployeeAvailable[] }[]
  >([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  // Data fetching
  const { data: clients } = useGetClients()
  const { data: services } = useGetServices()
  const queryClient = useQueryClient()
  const createClientMutation = useCreateClient()

  // Create a new client function
  const createNewClient = async (name: string) => {
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
  }

  // Reset slot and employee when date or service changes
  useEffect(() => {
    setSelectedSlot(null)
    setSelectedEmployeeIds([])
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
    } else {
      setActiveStep(3)
    }
  }, [clientId, serviceId, selectedSlot])

  // Handle default client name from props
  useEffect(() => {
    if (defaultClientName && clients) {
      // Find if client exists
      const existingClient = clients.find(client => 
        client.name.toLowerCase() === defaultClientName.toLowerCase())
      
      if (existingClient) {
        // If exists, select it
        setClientId(existingClient.id)
      } else {
        // If not, create automatically
        createNewClient(defaultClientName)
      }
    }
  }, [defaultClientName, clients])

  // Setup global window function for opening the dialog from external scripts
  useEffect(() => {
    window.openAppointmentDialog = (clientName?: string) => {
      if (clientName) {
        // Find if client exists
        const existingClient = clients?.find(client => 
          client.name.toLowerCase() === clientName.toLowerCase())
        
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
  }, [clients])

  // Reset form function
  const resetForm = () => {
    setClientId('')
    setServiceId('')
    setSelectedSlot(null)
    setSelectedEmployeeIds([])
    setAvailableSlots([])
    setActiveStep(1)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!clientId || !serviceId || !selectedSlot) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setLoading(true)

    const appointmentData = {
      clientId,
      serviceId,
      employeeIds: selectedEmployeeIds,
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

  // Get selected client and service objects
  const selectedClient = clients?.find(client => client.id === clientId)
  const selectedService = services?.find(service => service.id === serviceId)
  
  // Get employees for selected slot
  const slotEmployees = selectedSlot 
    ? availableSlots.find(s => JSON.stringify(s.slot) === selectedSlot)?.employees || []
    : []
  
  // Get selected employees
  const selectedEmployees = slotEmployees.filter(emp => selectedEmployeeIds.includes(emp.id))

  // Toggle employee selection
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // Get the formatted slot time for display
  const selectedSlotTime = selectedSlot 
    ? `${JSON.parse(selectedSlot).startAt} - ${JSON.parse(selectedSlot).endAt}`
    : null

  // Function to determine if fields have been filled
  const hasFilledFields = () => {
    return clientId !== '' || serviceId !== '' || selectedSlot !== null || selectedEmployeeIds.length > 0
  }

  // Return everything needed for the form
  return {
    // State
    activeStep,
    clientId,
    serviceId,
    date,
    availableSlots,
    selectedSlot,
    selectedEmployeeIds,
    loading,
    
    // Data
    clients,
    services,
    selectedClient,
    selectedService,
    slotEmployees,
    selectedEmployees,
    selectedSlotTime,
    
    // Actions
    setActiveStep,
    setClientId,
    setServiceId,
    setDate,
    setSelectedSlot,
    toggleEmployeeSelection,
    resetForm,
    handleSubmit,
    hasFilledFields,
  }
}

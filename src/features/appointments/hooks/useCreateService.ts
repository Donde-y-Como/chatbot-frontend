import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance'
import { Service } from '@/features/appointments/types.ts'

export function useCreateService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (serviceName: string) => {
      try {
        // Create a service with default values and user-provided name
        const service = {
          name: serviceName,
          description: `Servicio personalizado creado desde citas: ${serviceName}`,
          duration: {
            value: 30, // Default duration of 30
            unit: 'minutes' as const, // Using 'minutes' as default
          },
          price: {
            amount: 0, // Default price of 0
            currency: 'MXN', // Default currency USD
          },
          maxConcurrentBooks: 1, // Default to 1 concurrent booking
          minBookingLeadHours: 1, // Default to 1 hour lead time
          schedule: {
            // Default schedule - every day from 9:00 AM to 6:00 PM
            'monday': { startAt: 9 * 60, endAt: 18 * 60 },
            'tuesday': { startAt: 9 * 60, endAt: 18 * 60 },
            'wednesday': { startAt: 9 * 60, endAt: 18 * 60 },
            'thursday': { startAt: 9 * 60, endAt: 18 * 60 },
            'friday': { startAt: 9 * 60, endAt: 18 * 60 },
            'saturday': { startAt: 9 * 60, endAt: 15 * 60 }, // Shorter hours on Saturday
            'sunday': { startAt: 0, endAt: 0 } // Closed on Sunday
          }
        }
        
        const response = await api.post<Service>('/services', service)
        return response.data
      } catch (error) {
        console.error('Error creating service:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate to refresh the services list
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}
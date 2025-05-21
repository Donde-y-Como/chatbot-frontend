import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance'
import { useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts'
import { Service } from '@/features/appointments/types.ts'

export function useCreateService() {
  const queryClient = useQueryClient()
  const { data: schedule } = useGetWorkSchedule(new Date())

  return useMutation({
    mutationFn: async (serviceName: string) => {
      try {
        // Create a service with default values and user-provided name
        const service = {
          name: serviceName,
          description: `Servicio personalizado creado desde citas: ${serviceName}`,
          duration: {
            value: 60,
            unit: 'minutes' as const,
          },
          price: {
            amount: 0,
            currency: 'MXN',
          },
          schedule: schedule
            ? schedule.weeklyWorkDays
            : {
                MONDAY: { startAt: 9 * 60, endAt: 18 * 60 },
                TUESDAY: { startAt: 9 * 60, endAt: 18 * 60 },
                WEDNESDAY: { startAt: 9 * 60, endAt: 18 * 60 },
                THURSDAY: { startAt: 9 * 60, endAt: 18 * 60 },
                FRIDAY: { startAt: 9 * 60, endAt: 18 * 60 },
                SATURDAY: { startAt: 9 * 60, endAt: 15 * 60 },
              },
        }

        const response = await api.post<Service>('/services', service)
        return response.data
      } catch (error) {
        console.error('Error creating service:', error)
        throw error
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

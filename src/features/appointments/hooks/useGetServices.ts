import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'

export function useGetServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        return await appointmentService.getServices();
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
    },
    // Using a short staleTime to allow refreshes
    staleTime: 50000,
    retry: 2, // Retry failed requests up to 2 times
  })
}

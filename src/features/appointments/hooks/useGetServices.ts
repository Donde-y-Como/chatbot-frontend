import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'

export function useGetServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: appointmentService.getServices,
    staleTime: Infinity
  })
}

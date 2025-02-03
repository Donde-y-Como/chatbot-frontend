import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'

export function useGetClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: appointmentService.getClients,
    staleTime: Infinity,
  })
}

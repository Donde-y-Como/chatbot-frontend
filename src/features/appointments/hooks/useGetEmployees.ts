import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'

export function useGetEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: appointmentService.getEmployees,
  })
}

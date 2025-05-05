import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'

export const UseGetAppointmentsQueryKey = 'appointments' as const

export function useGetAppointments(startDate: string, endDate?: string) {
  if (!endDate) {
    endDate = startDate
  }
  return useQuery({
    queryKey: [UseGetAppointmentsQueryKey, startDate, endDate],
    queryFn: () => appointmentService.getAppointments(startDate, endDate),
    staleTime: Infinity,
  })
}

import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'

export const GET_CLIENTS_QUERY_KEY = ['clients'] as const;

export function useGetClients() {
  return useQuery({
    queryKey: GET_CLIENTS_QUERY_KEY,
    queryFn: appointmentService.getClients,
    staleTime: 5000,
  })
}

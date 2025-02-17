import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { EventWithBookings } from '@/features/events/types.ts'

export function useGetEventWithBookings(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () =>
      api.get<EventWithBookings>('/events/' + id).then((res) => res.data),
  })
}

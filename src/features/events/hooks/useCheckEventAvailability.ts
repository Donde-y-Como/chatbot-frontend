import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { format } from 'date-fns'
import { EventAvailability } from '@/features/events/types.ts'

export function useCheckEventAvailability(eventId: string, date: Date | null) {
  return useQuery({
    queryKey: ['event', eventId, 'availability', date],
    enabled: date instanceof Date,
    queryFn: () =>
      date ?
        api.get<EventAvailability>(`/events/${eventId}/availability?date=${format(date, 'yyyy-MM-dd')}`)
          .then((res) => res.data)
        : Promise.resolve(null)
  })
}

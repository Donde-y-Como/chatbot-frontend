import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { EventPrimitives } from '@/features/events/types.ts'

export function useGetEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () =>
      api.get<EventPrimitives[]>('/events').then((res) => res.data),
  })
}

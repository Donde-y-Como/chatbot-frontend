import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { Booking } from '@/features/events/types.ts'

export function useGetBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings').then((res) => res.data),
  })
}

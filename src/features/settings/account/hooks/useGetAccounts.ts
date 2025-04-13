import { useQuery } from '@tanstack/react-query'
import { AccountApiService } from '../accountApiService'

export function useGetAccount() {
  return useQuery({
    queryKey: ['whatsapp'],
    queryFn: AccountApiService.find,
    staleTime: Infinity,
  })
}

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/features/auth/AuthService.ts'

export function useGetUser() {
  return useQuery({
    queryKey: UserQueryKey,
    queryFn: authService.getMe,
    staleTime: Infinity,
  })
}

export function useGetBusiness() {
  return useQuery({
    queryKey: BusinessQueryKey,
    queryFn: authService.getMyBusiness,
    staleTime: Infinity,
  })
}

export function useGetUserAndBusiness() {
  const userQuery = useGetUser()
  const businessQuery = useGetBusiness()
  
  return {
    user: userQuery.data,
    business: businessQuery.data,
    isLoading: userQuery.isLoading || businessQuery.isLoading,
    error: userQuery.error || businessQuery.error,
  }
}

export const UserQueryKey = ['user'] as const
export const BusinessQueryKey = ['business'] as const
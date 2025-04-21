import { useQuery } from '@tanstack/react-query'
import { authService } from '@/features/auth/AuthService.ts'

export function useGetUser() {
  return useQuery({
    queryKey: UserQueryKey,
    queryFn: authService.getMe,
    staleTime: Infinity,
  })
}

export const UserQueryKey = ['user'] as const
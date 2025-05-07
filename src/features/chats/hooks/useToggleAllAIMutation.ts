import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { UserQueryKey } from '@/components/layout/hooks/useGetUser.ts'
import { UserData } from '@/features/auth/types.ts'

export function useToggleAllAIMutation() {
  const queryClient = useQueryClient()
  const { emit } = useWebSocket()

  return useMutation({
    mutationKey: ['all-ia-toggle'],
    async mutationFn(data: { enabled: boolean; userId: string }) {
      emit(
        data.enabled ? 'enableAllAssistants' : 'disableAllAssistants',
        data.userId
      )

      return { success: true, enabled: data.enabled }
    },
    onSuccess: async (_data, { enabled }) => {
      queryClient.setQueryData<UserData>(UserQueryKey, (cachedUser) => {
        if (!cachedUser) return cachedUser
        return {
          ...cachedUser,
          assistantConfig: { ...cachedUser.assistantConfig, enabled },
        }
      })
    },
  })
}

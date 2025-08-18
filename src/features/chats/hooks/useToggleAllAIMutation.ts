import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { BusinessQueryKey, UserQueryKey } from '@/components/layout/hooks/useGetUser.ts'
import { BusinessData, UserData } from '@/features/auth/types.ts'

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
      queryClient.setQueryData<BusinessData>(BusinessQueryKey, (cachedBusiness) => {
        if (!cachedBusiness) return cachedBusiness
        return {
          ...cachedBusiness,
          assistantConfig: { ...cachedBusiness.assistantConfig, enabled },
        }
      })
    },
  })
}

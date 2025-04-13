import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AccountApiService } from '../accountApiService'
import { AccountPrimitives } from '../types'

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (account: Partial<AccountPrimitives>) => {
      await AccountApiService.update(account)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp'] })
    },
  })
}

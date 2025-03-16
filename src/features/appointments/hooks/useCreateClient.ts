import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientApiService } from '@/features/clients/ClientApiService'

export function useCreateClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (name: string) => {
      const client = await ClientApiService.create({
        name,
        platformIdentities: [],
        tagIds: [],
        annexes: [],
        photo: '',
        notes: '',
        email: '',
        address: '',
      })
      return client
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

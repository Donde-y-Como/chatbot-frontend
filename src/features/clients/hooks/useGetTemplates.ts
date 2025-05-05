import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { Template } from '@/features/chats/ChatTypes.ts'

export function useGetTemplates() {
  return useQuery({
    queryKey: GetTemplatesQueryKey,
    queryFn: async () => {
      const t = await api.get<Template[]>('/templates')
      return t.data
    },
  })
}

export const GetTemplatesQueryKey = ['templates'] as const

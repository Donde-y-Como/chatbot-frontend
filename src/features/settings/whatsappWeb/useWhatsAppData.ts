import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { useGetUser } from '@/components/layout/hooks/useGetUser'

export const WHATSAPP_QUERY_KEY = ['whatsapp'] as const

export function useWhatsAppData() {
  const { data: user } = useGetUser()

  return useQuery({
    queryKey: [...WHATSAPP_QUERY_KEY, user],
    queryFn: async () => {
      if (!user) throw Error('User not found')

      const data = await api.get<{ isConnected: boolean }>(
        '/whatsapp-web/status'
      )

      if (!data.data.isConnected) {
        const qr = await api.get<{ qrCode: string }>('whatsapp-web/qr')
        return { isConnected: data.data.isConnected, qr: qr.data.qrCode }
      }

      return { isConnected: data.data.isConnected, qr: '' }
    },
    staleTime: Infinity,
    enabled: !!user,
  })
}

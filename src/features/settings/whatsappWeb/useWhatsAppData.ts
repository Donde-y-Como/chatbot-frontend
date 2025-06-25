import { useQuery } from '@tanstack/react-query'
import { getInstanceId } from '@/lib/utils'
import { useGetUser } from '@/components/layout/hooks/useGetUser'
import { WaapiClientStatus, waapiService } from './waapi-service'

export const WHATSAPP_QUERY_KEY = ['whatsapp'] as const

export type WhatsAppData = WaapiClientStatus & {
  qr: string
}

export function useWhatsAppData() {
  const { data: user } = useGetUser()

  return useQuery({
    queryKey: [...WHATSAPP_QUERY_KEY, user],
    queryFn: async () => {
      if (!user) throw Error('User not found')

      const instanceId = getInstanceId(user)!

      const data = await waapiService.clientStatus(instanceId)

      if (data.instanceStatus === 'qr') {
        const qr = await waapiService.qr(instanceId)
        return { ...data, qr: qr.data.qr_code }
      }

      return { ...data, qr: '' }
    },
    staleTime: Infinity,
    enabled: !!user,
  })
}

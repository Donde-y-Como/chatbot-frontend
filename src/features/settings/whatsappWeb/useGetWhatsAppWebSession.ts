import { useQuery } from '@tanstack/react-query'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'

export const WhatsAppWebSessionQueryKey = ['whatsAppSession'] as const

export function useGetWhatsAppWebSession() {
  return useQuery({
    queryKey: WhatsAppWebSessionQueryKey,
    queryFn: () => baileysService.getCurrentSession(),
    refetchOnWindowFocus: false,
  })
}

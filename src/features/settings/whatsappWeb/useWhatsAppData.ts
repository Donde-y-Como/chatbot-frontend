import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { useGetUser } from '@/components/layout/hooks/useGetUser'

export const WHATSAPP_QUERY_KEY = ['whatsapp'] as const

export function useWhatsAppData() {
  const { data: user } = useGetUser()

  return useQuery({
    queryKey: [...WHATSAPP_QUERY_KEY, user],
    queryFn: async () => {
      if (!user) throw new Error('User not found')

      try {
        const statusResponse = await api.get<{ 
          status?: 'open' | 'closed',
          isConnected?: boolean 
        }>('/whatsapp-web/status')
        
        // Handle both possible response formats
        const isConnected = statusResponse.data.status === 'open' || statusResponse.data.isConnected === true
        
        // If WhatsApp is connected, return immediately without fetching QR
        if (isConnected) {
          return { isConnected: true, qr: '', hasWhatsAppInstance: true }
        }

        // Only fetch QR code if WhatsApp is not connected
        try {
          const qrResponse = await api.get<{ qrCode: string }>('/whatsapp-web/qr')
          return { isConnected: false, qr: qrResponse.data.qrCode, hasWhatsAppInstance: true }
        } catch (qrError) {
          // If QR code fetch fails, return disconnected state without QR
          return { isConnected: false, qr: '', hasWhatsAppInstance: true }
        }
      } catch (statusError: any) {
        // Check if it's a 404 (WhatsApp instance not found) or 400 (no WhatsApp setup)
        if (statusError?.response?.status === 404 || statusError?.response?.status === 400) {
          return { isConnected: false, qr: '', hasWhatsAppInstance: false }
        }
        // For other errors, assume there might be a WhatsApp instance but connection failed
        return { isConnected: false, qr: '', hasWhatsAppInstance: true }
      }
    },
    enabled: !!user,
    retry: false, // Prevent retries to avoid infinite loops on 400 errors
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  })
}

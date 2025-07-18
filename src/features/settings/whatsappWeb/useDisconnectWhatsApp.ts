import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { WHATSAPP_QUERY_KEY } from './useWhatsAppData'

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient()

  const { mutateAsync: disconnectWhatsApp } = useMutation({
    mutationFn: async () => {
      await api.delete('/whatsapp-web/logout')
    },
    onSuccess: () => {
      toast.success('WhatsApp desconectado')
    },
    onError: () => {
      toast.error('Error al desconectar WhatsApp')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WHATSAPP_QUERY_KEY })
    },
  })

  return {
    disconnectWhatsApp,
  }
}

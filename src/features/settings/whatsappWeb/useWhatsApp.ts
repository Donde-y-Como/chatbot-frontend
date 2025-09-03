import { useWhatsAppData } from './useWhatsAppData'

export function useWhatsApp() {
  const { data: whatsappData, isLoading, isError } = useWhatsAppData()

  return {
    isConnected: whatsappData?.isConnected ?? false,
    hasWhatsAppInstance: whatsappData?.hasWhatsAppInstance ?? false,
    isLoading: isLoading && !isError, // Don't show loading if there's an error
    whatsappData,
    isError,
  }
}
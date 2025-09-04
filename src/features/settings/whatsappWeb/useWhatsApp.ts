import { useWhatsAppData } from './useWhatsAppData'

export interface WhatsAppState {
  isConnected: boolean
  hasWhatsAppInstance: boolean
  qrCode?: string
  isLoading: boolean
  isError: boolean
  errorType?: 'network' | 'not_found' | 'unauthorized' | 'server' | 'unknown'
  isInitialLoading: boolean
  canRetry: boolean
  retryFn: () => void
}

export function useWhatsApp(): WhatsAppState {
  const { data: whatsappData, isLoading, isError, error, refetch, isFetching } = useWhatsAppData()
  
  // Determine error type for better UX
  const errorType = (() => {
    if (!isError || !error) return undefined
    
    const status = (error as any)?.response?.status
    if (status === 404) return 'not_found'
    if (status === 401 || status === 403) return 'unauthorized'
    if (status >= 500) return 'server'
    if (!navigator.onLine) return 'network'
    return 'unknown'
  })()

  return {
    isConnected: whatsappData?.isConnected ?? false,
    hasWhatsAppInstance: whatsappData?.hasWhatsAppInstance ?? false,
    qrCode: whatsappData?.qr,
    isLoading: (isLoading || isFetching) && !isError,
    isError,
    errorType,
    isInitialLoading: isLoading && !whatsappData,
    canRetry: isError && errorType !== 'not_found',
    retryFn: () => refetch(),
  }
}
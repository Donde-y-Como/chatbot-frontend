import { useQuery } from '@tanstack/react-query'
import { portalApi } from '@/api/axiosInstance'

export interface ClientServiceHistory {
  id: string
  date: string
  service: string
  employee: string
  amount: number
  currency: string
  status: 'completed' | 'paid' | 'pending'
  notes?: string
  invoice?: string
}

export interface ClientPortalServicesHistoryResponse {
  success: boolean
  data: ClientServiceHistory[]
  message: string
  total: number
}

const getClientServicesHistory = async (clientId: string, token: string): Promise<ClientServiceHistory[]> => {
  const response = await portalApi.get<ClientPortalServicesHistoryResponse>(`/clients/portal/${clientId}/services-history`, {
    headers: {
      'X-Portal-Token': token
    }
  })

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener el historial de servicios')
  }

  return response.data.data
}

export function useClientPortalServicesHistory(clientId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-services-history', clientId,token],
    queryFn: () => getClientServicesHistory(clientId, token),
    enabled: enabled && !!clientId && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}
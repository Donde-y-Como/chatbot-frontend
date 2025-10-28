import { useMutation, useQuery } from '@tanstack/react-query'
import { portalApi } from '@/api/axiosInstance'

export interface SupportRequest {
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  category: 'general' | 'appointment' | 'billing' | 'technical'
}

export interface SupportResponse {
  success: boolean
  ticketId?: string
  message: string
}

export interface ContactInfo {
  phone: string
  email: string
  whatsapp: string
  address: string
  businessHours: {
    [key: string]: string // day -> hours
  }
}

const sendSupportRequest = async (
  clientId: string,
  token: string,
  request: SupportRequest
): Promise<SupportResponse> => {
  const response = await portalApi.post<SupportResponse>(
    `/clients/portal/${clientId}/support-request`,
    request,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  return response.data
}

const getContactInfo = async (
  clientId: string,
  token: string
): Promise<ContactInfo> => {
  const response = await portalApi.get<{success: boolean, data: ContactInfo, message: string}>(
    `/clients/portal/${clientId}/contact-info`,
    {
      headers: {
        'X-Portal-Token': token
      }
    }
  )

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener información de contacto')
  }

  return response.data.data
}

export function useClientPortalSupportRequest(clientId: string, token: string) {
  return useMutation({
    mutationFn: (request: SupportRequest) => sendSupportRequest(clientId, token, request),
  })
}

export function useClientPortalContactInfo(clientId: string, token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-portal-contact-info', clientId, token],
    queryFn: () => getContactInfo(clientId, token),
    enabled: enabled && !!clientId && !!token,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })
}
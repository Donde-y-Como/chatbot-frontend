import { api } from '@/api/axiosInstance.ts'
import {
  baileysApi,
  CreateSessionResponse,
  GetQRCodeResponse,
  QRCodeData,
  SessionData,
} from '@/features/settings/whatsappWeb/types.ts'
import { UserData } from '@/features/auth/types.ts'

export const baileysService = {
  createSession: async (
    phoneNumber: string
  ): Promise<CreateSessionResponse> => {
    const response = await baileysApi.post<CreateSessionResponse>('/sessions', {
      userId: phoneNumber,
    })

    if (response.status >= 400) {
      throw new Error('No se pudo crear la session de whatsapp web')
    }

    return response.data
  },

  stopSession: async (sessionId: string) => {
    const response = await baileysApi.delete('/sessions/' + sessionId)

    if (response.status >= 400 || !response.data.success) {
      throw new Error('No se pudo detener la sesion de whatsapp web')
    }
  },

  getQRCode: async (sessionId: string): Promise<QRCodeData> => {
    const response = await baileysApi.get<GetQRCodeResponse>(
      '/sessions/' + sessionId + '/qr'
    )

    if (response.status >= 400 || !response.data.success) {
      throw new Error('No se pudo obtener el QR de whatsapp web')
    }

    return response.data.data
  },

  getCurrentSession: async (sessionId: string): Promise<SessionData> => {
    const response = await baileysApi.get<CreateSessionResponse>(
      '/sessions/' + sessionId
    )

    if (response.status >= 400 || !response.data.success) {
      throw new Error('No se pudo obtener la sesion de whatsapp')
    }

    return response.data.data
  },

  connectToBusiness: async (sessionId: string): Promise<void> => {
    const response = await api.post('/business/whatsappWeb', { sessionId })

    if (response.status >= 400) {
      throw new Error('No se pudo obtener la sesion de whatsapp')
    }
  },

  removeWhatsappWebSession: async (user: UserData): Promise<void> => {
    const response = await api.put('/auth/user', {
      socialPlatforms: user.socialPlatforms.filter(
        (platform) => platform.platformName !== 'whatsappWeb'
      ),
    })
  },
}

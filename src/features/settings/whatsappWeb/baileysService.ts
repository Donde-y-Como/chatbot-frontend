import { api } from '@/api/axiosInstance.ts'
import { UserData } from '@/features/auth/types.ts'
import { PlatformName } from '@/features/clients/types.ts'
import {
  baileysApi,
  CreateSessionResponse,
  GetQRCodeResponse,
  QRCodeData,
} from '@/features/settings/whatsappWeb/types.ts'

export const baileysService = {
  createSession: async (
    phoneNumber: string
  ): Promise<CreateSessionResponse> => {
    const response = await baileysApi.post<CreateSessionResponse>('/sessions', {
      userId: phoneNumber,
    })

    if (response.status >= 400 || !response.data.success) {
      throw new Error('No se pudo crear la session de whatsapp web')
    }

    return response.data
  },

  stopSession: async (sessionId: string) => {
    const response = await baileysApi.delete('/sessions/' + sessionId)
    localStorage.removeItem('sessionId')

    return !(response.status >= 400 || !response.data.success)
  },

  getQRCode: async (sessionId: string): Promise<QRCodeData | null> => {
    try {
      const response = await baileysApi.get<GetQRCodeResponse>(
        '/sessions/' + sessionId + '/qr'
      )

      if (
        (response.status >= 400 && response.status < 500) ||
        !response.data.success
      ) {
        return null
      }

      return response.data.data
    } catch (e) {
      return null
    }
  },

  getCurrentSession: async (
    givenSessionId?: string
  ): Promise<CreateSessionResponse | null> => {
    try {
      const sessionId =
        givenSessionId || localStorage.getItem('sessionId') || ''

      const response = await baileysApi.get<CreateSessionResponse>(
        '/sessions/' + sessionId
      )

      if (
        (response.status >= 400 && response.status < 500) ||
        !response.data.success
      ) {
        return null
      }

      return response.data
    } catch (e) {
      return null
    }
  },

  connectToBusiness: async (
    platformId: string,
    sessionId: string
  ): Promise<void> => {
    const response = await api.post('/business/whatsappWeb', {
      platformId,
      sessionId,
    })

    localStorage.setItem('sessionId', response.data.id)

    if (response.status >= 400) {
      throw new Error('No se pudo conectar la sesion de whatsapp')
    }
  },

  removeWhatsappWebSession: async (user: UserData): Promise<void> => {
    await api.put('/auth/user', {
      socialPlatforms: user.socialPlatforms.filter(
        (platform) => platform.platformName !== PlatformName.WhatsappWeb
      ),
    })
  },
}

import axios from 'axios'

export const baileysApi = axios.create({
  baseURL: import.meta.env.VITE_BAILEYS_API_URL || 'http://localhost:3000/api',
})

baileysApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer token`
  return config
})

export type SessionStatus =
  | 'creating'
  | 'starting'
  | 'scanning_qr'
  | 'connected'
  | 'disconnected'
  | 'error'

export interface SessionData {
  id: string
  userId: string
  status: SessionStatus
  createdAt: string
  lastUsed: string
  qr?: string
}

export interface QRCodeData {
  sessionId: string
  qrCode: string
}

export type CreateSessionResponse = {
  success: boolean
  data: SessionData
}

export type GetQRCodeResponse = {
  success: boolean
  data: QRCodeData
}

import { ClientPrimitives } from '../clients/types'

export type Template = {
  businessId: string
  name: string
  content: string
  category: string
  status: string
}

export type Chat = {
  id: string
  platformName: string
  client?: ClientPrimitives
  lastMessage: Message | null
  newClientMessagesCount: number
}

export type MessageRole = 'business' | 'user' | 'assistant' | 'system'

export type Message = {
  id: string
  content: string
  role: MessageRole
  timestamp: number
  media: Media | null
}

export type Thread = {
  id: string
  enabled: boolean
}

export type ChatMessages = {
  id: string
  clientId: string
  businessId: string
  platformName: string
  messages: Message[]
  thread: Thread
  newClientMessagesCount: number
  currentIntention: string
  client: Client
}

export enum PlatformName {
  Whatsapp = 'whatsapp',
  Facebook = 'facebook',
  Instagram = 'instagram',
  WhatsappWeb = 'whatsappWeb',
}

export type Media = {
  type: string
  url: string
  caption?: string
}

export type PlatformIdentity = {
  platformId: string
  platformName: PlatformName
  profileName: string
}

export type Annex = {
  name: string
  media: Media
}

export type Client = {
  id: string
  businessId: string
  name: string
  platformIdentities: PlatformIdentity[]
  tagIds: string[]
  annexes: Annex[]
  photo: string
  notes: string
  email: string
  address: string
  birthdate?: string
  createdAt: string
  updatedAt: string
}

// Nuevos tipos para la paginación
export type ChatPaginationMeta = {
  perPage: number
  pageNumber: number
  total: number
  hasNextPage: boolean
  nextPage: number
}

export type ChatResponse = {
  conversations: Chat[]
  meta: ChatPaginationMeta
}

export type ChatParams = {
  pageNumber?: number
  perPage?: number
  platformName?: string
  clientName?: string
}

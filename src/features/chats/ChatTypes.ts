export type Chat = {
  id: string
  platformName: string
  client: Client
  clientProfileId: string | null
  lastMessage: Message
  newClientMessagesCount: number
}

export type Message = {
  id: string
  content: string
  role: 'business' | 'user' | 'assistant'
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
  clientProfileConversationIds: {
    instagram?: string[]
    whatsapp?: string[]
    facebook?: string[]
  }
}

export type Media = {
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
}

export type Client = {
  id: string
  businessId: string
  platformId: string
  platformName: string
  profileName: string
}

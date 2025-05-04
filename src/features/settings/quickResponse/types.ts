import { Media } from '@/features/chats/ChatTypes.ts'

export interface QuickResponse {
  id: string
  businessId: string
  title: string
  content: string
  media?: Media
}

export interface QuickResponseFormValues {
  title: string;
  content: string;
  media?: Media
}

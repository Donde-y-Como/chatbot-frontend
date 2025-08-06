import { uid } from 'uid'
import { Message, Media } from '@/features/chats/ChatTypes'
import { QuickResponse } from '@/features/settings/quickResponse/types'

export interface MessageSenderService {
  createTextMessage(content: string): Message
  createMediaMessage(media: Media): Message
  createQuickResponseMessage(quickResponse: QuickResponse): Message[]
}

export class DefaultMessageSenderService implements MessageSenderService {
  private createBaseMessage(): Omit<Message, 'id' | 'content' | 'media'> {
    return {
      role: 'business',
      timestamp: Date.now(),
    }
  }

  createTextMessage(content: string): Message {
    return {
      id: uid(),
      content: content.trim(),
      media: null,
      ...this.createBaseMessage(),
    }
  }

  createMediaMessage(media: Media): Message {
    return {
      id: uid(),
      content: media.caption || '',
      media,
      ...this.createBaseMessage(),
    }
  }

  createQuickResponseMessage(quickResponse: QuickResponse): Message[] {
    const messages: Message[] = []
    
    // Create text message if content exists
    if (quickResponse.content.trim()) {
      messages.push(this.createTextMessage(quickResponse.content))
    }

    // Create individual messages for each media item
    if (quickResponse.medias && quickResponse.medias.length > 0) {
      quickResponse.medias.forEach((media) => {
        messages.push(this.createMediaMessage(media))
      })
    }

    return messages
  }
}

export interface MessageBatch {
  messages: Message[]
  hasContent: boolean
  hasMedia: boolean
  totalCount: number
}

export interface MessageBatchProcessor {
  createBatch(quickResponse: QuickResponse): MessageBatch
  validateBatch(batch: MessageBatch): boolean
}

export class DefaultMessageBatchProcessor implements MessageBatchProcessor {
  constructor(private messageSender: MessageSenderService) {}

  createBatch(quickResponse: QuickResponse): MessageBatch {
    const messages = this.messageSender.createQuickResponseMessage(quickResponse)
    
    return {
      messages,
      hasContent: !!quickResponse.content.trim(),
      hasMedia: quickResponse.medias && quickResponse.medias.length > 0,
      totalCount: messages.length,
    }
  }

  validateBatch(batch: MessageBatch): boolean {
    return batch.totalCount > 0 && batch.messages.every(msg => 
      msg.content.trim() || msg.media
    )
  }
}
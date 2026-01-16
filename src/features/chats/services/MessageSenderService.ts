import { uid } from 'uid'
import { Message, Media } from '@/features/chats/ChatTypes'
import { QuickResponse } from '@/features/settings/quickResponse/types'

function inferFilenameFromUrl(url: string, mimetype?: string) {
  const mt = (mimetype || '').toLowerCase()
  const extFromMime = (() => {
    if (mt === 'application/pdf') return '.pdf'
    if (mt === 'text/plain') return '.txt'
    if (mt === 'application/vnd.ms-excel') return '.xls'
    if (mt === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return '.xlsx'
    if (mt === 'application/msword') return '.doc'
    if (mt === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx'
    if (mt === 'application/vnd.ms-powerpoint') return '.ppt'
    if (mt === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return '.pptx'
    if (mt === 'video/mp4') return '.mp4'
    if (mt === 'image/png') return '.png'
    if (mt === 'image/jpg' || mt === 'image/jpeg') return '.jpg'
    return ''
  })()

  const fromUrl = (() => {
    try {
      const parsed = new URL(url)
      const last = parsed.pathname.split('/').filter(Boolean).pop()
      return last ? decodeURIComponent(last) : 'archivo'
    } catch {
      const last = url.split('/').pop()
      return last || 'archivo'
    }
  })()

  if (fromUrl.includes('.')) return fromUrl
  return `${fromUrl}${extFromMime}`
}

function ensureMediaFilename(media: Media): Media {
  if (media.filename) return media
  if (!media.url) return media
  return {
    ...media,
    filename: inferFilenameFromUrl(media.url, media.mimetype),
  }
}

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
    const normalizedMedia = ensureMediaFilename(media)
    return {
      id: uid(),
      content: normalizedMedia.caption || '',
      media: normalizedMedia,
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
        messages.push(this.createMediaMessage(ensureMediaFilename(media)))
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
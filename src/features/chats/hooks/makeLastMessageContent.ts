import { Message } from '@/features/chats/ChatTypes.ts'

export function makeLastMessageContent(message: Message): Message {
  if (message.media) {
    return {
      ...message,
      content: getLasMessageMediaContent(message.media.type),
    }
  }

  return message
}

function getLasMessageMediaContent(type: string) {
  const mediaMap: Record<string, string> = {
    image: '📷 Foto',
    video: '🎞️ Video',
    document: '📄 Documento',
    sticker: '🖼️ Sticker',
  }

  return mediaMap[type] || 'Archivo'
}

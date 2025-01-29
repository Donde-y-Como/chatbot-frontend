import { Message } from '@/features/chats/ChatTypes.ts'

export function makeLastMessageContent(message: Message): Message{
  if(message.media) {
    const mediaType = message.media.type;
    const icon = mediaType === 'image' ? '📷' :
      mediaType === 'video' ? '📹' :
        mediaType === 'document' ? '📎' : '';

    return {...message, content: `${icon} ${mediaType}`}
  }

  return message;
}
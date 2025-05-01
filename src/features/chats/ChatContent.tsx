import { useMemo, useCallback, useEffect, useState } from 'react'
import { uid } from 'uid'
import { differenceInHours } from 'date-fns'
import { cn } from '@/lib/utils'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import {
  ChatConversation,
  ChatConversationSkeleton,
} from '@/features/chats/ChatConversation'
import ChatFooter from '@/features/chats/ChatFooter.tsx'
import { Chat, ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import {
  ConversationHeader,
  ConversationHeaderSkeleton,
} from '@/features/chats/ConversationHeader.tsx'

interface ChatContentProps {
  isLoading: boolean
  chatData?: ChatMessages | undefined | null
  selectedChatId: string
  mobileSelectedChatId: string | null
  isMobileVisible: boolean
  onBackClick: () => void
}

export function ChatContent({
  isLoading,
  chatData,
  selectedChatId,
  mobileSelectedChatId,
  isMobileVisible,
  onBackClick,
}: ChatContentProps) {
  const canSendMessages = useMemo(() => {
    if (!chatData) return false

    if (chatData.platformName === 'whatsappWeb') {
      return true
    }

    const userMessages = chatData.messages.filter(
      (message) => message.role === 'user'
    )
    const lastUserMessage = userMessages.at(-1)

    if (!lastUserMessage) return false

    const lastTimestamp = lastUserMessage.timestamp
    const now = Date.now()
    return differenceInHours(now, lastTimestamp) < 24
  }, [chatData])

  // Get the timestamp of the last message for the chat expiration check
  const lastMessageTimestamp = useMemo(() => {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) return undefined
    return chatData.messages[chatData.messages.length - 1].timestamp
  }, [chatData])

  // State to track if we've already sent an expiration message
  const [hasSentExpirationMessage, setHasSentExpirationMessage] = useState(false)
  
  // Check if chat has expired (more than 24 hours since last message)
  const isChatExpired = useMemo(() => {
    if (!lastMessageTimestamp) return false
    
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000
    const now = Date.now()
    
    return now - lastMessageTimestamp > twentyFourHoursInMs
  }, [lastMessageTimestamp])
  
  // Check if there's already an expiration message in the chat
  const hasExpirationMessage = useMemo(() => {
    if (!chatData || !chatData.messages) return false
    return chatData.messages.some(msg => msg.isExpiredNotice)
  }, [chatData])
  
  // Use the WebSocket to send messages
  const { sendMessage: sendToWebSocket } = useWebSocket()
  
  // Send expiration message if needed
  useEffect(() => {
    // Only send if: 
    // 1. Chat is expired 
    // 2. We have chat data 
    // 3. There's no existing expiration message 
    // 4. We haven't sent one in this session
    if (isChatExpired && chatData && !hasExpirationMessage && !hasSentExpirationMessage && canSendMessages) {
      const expirationMessage: Message = {
        id: uid(),
        content: 'Este chat ha estado inactivo por más de 24 horas. Por motivos de seguridad y privacidad, la conversación ha sido archivada automáticamente. Si necesitas continuar la conversación, puedes enviar un nuevo mensaje.',
        role: 'system',
        timestamp: Date.now(),
        media: null,
        isExpiredNotice: true
      }
      
      // Send message via WebSocket
      sendToWebSocket({
        conversationId: selectedChatId,
        message: expirationMessage
      })
      
      // Mark that we've sent the message
      setHasSentExpirationMessage(true)
    }
  }, [isChatExpired, chatData, hasExpirationMessage, hasSentExpirationMessage, canSendMessages, selectedChatId, sendToWebSocket])

  return (
    <div
      className={cn(
        'absolute inset-0 hidden left-full z-50 w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex sm:mr-2',
        isMobileVisible && 'left-0 flex'
      )}
    >
      {isLoading || !chatData || !selectedChatId ? (
        <ConversationHeaderSkeleton />
      ) : (
        <ConversationHeader
          chatData={chatData}
          selectedChatId={selectedChatId}
          onBackClick={onBackClick}
        />
      )}

      <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0'>
        {isLoading ? (
          <ChatConversationSkeleton />
        ) : (
          <ChatConversation
            messages={chatData?.messages}
            mobileSelectedChatId={mobileSelectedChatId}
          />
        )}

        <ChatFooter
          selectedChatId={selectedChatId}
          canSendMessage={canSendMessages}
        />
      </div>
    </div>
  )
}

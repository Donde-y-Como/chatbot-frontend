import { useMemo } from 'react'
import { differenceInHours } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  ChatConversation,
  ChatConversationSkeleton,
} from '@/features/chats/ChatConversation'
import ChatFooter from '@/features/chats/ChatFooter.tsx'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'
import {
  ConversationHeader,
  ConversationHeaderSkeleton,
} from '@/features/chats/ConversationHeader.tsx'
import { useGetWhatsAppWebSession } from '@/features/settings/whatsappWeb/useGetWhatsAppWebSession.ts'

interface ChatContentProps {
  isLoading: boolean
  chatData: ChatMessages | undefined
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
  const { data: whatsappData } = useGetWhatsAppWebSession()

  const canSendMessages = useMemo(() => {
    if (!chatData) return false

    if (chatData.platformName === 'whatsappWeb') {
      return whatsappData?.data.status === 'connected'
    }

    const userMessages = chatData.messages.filter(
      (message) => message.role === 'user'
    )
    const lastUserMessage = userMessages.at(-1)

    if (!lastUserMessage) return false

    const lastTimestamp = lastUserMessage.timestamp

    return differenceInHours(Date.now(), lastTimestamp) < 24
  }, [chatData, whatsappData?.data.status])

  const isWhatsAppChat = useMemo(() => {
    if (!chatData) return false

    return chatData.platformName === 'whatsapp'
  }, [chatData])

  const isWhatsAppWebChat = useMemo(() => {
    if (!chatData) return false

    return chatData.platformName === 'whatsappWeb'
  }, [chatData])

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
        {isLoading || !chatData ? (
          <ChatConversationSkeleton />
        ) : (
          <ChatConversation
            messages={chatData.messages}
            mobileSelectedChatId={mobileSelectedChatId}
          />
        )}

        <ChatFooter
          isWhatsAppWebChat={isWhatsAppWebChat}
          isWhatsAppChat={isWhatsAppChat}
          selectedChatId={selectedChatId}
          canSendMessage={canSendMessages}
        />
      </div>
    </div>
  )
}

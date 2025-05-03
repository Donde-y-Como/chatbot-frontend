import { useMemo, useCallback, useEffect, useState } from 'react'
import { differenceInHours } from 'date-fns'
import { uid } from 'uid'
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
import { useGetWhatsAppWebSession } from '@/features/settings/whatsappWeb/useGetWhatsAppWebSession.ts'

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
  const { data: whatsappData } = useGetWhatsAppWebSession()

  const canSendMessages = useMemo(() => {
    if (!chatData) return false

    if (chatData.platformName === 'whatsappWeb' && whatsappData?.data.status === "connected") {
      return true
    }

    const userMessages = chatData.messages.filter(
      (message) => message.role === 'user',
    )
    const lastUserMessage = userMessages.at(-1)

    if (!lastUserMessage) return false

    const lastTimestamp = lastUserMessage.timestamp
    const now = Date.now()
    return differenceInHours(now, lastTimestamp) < 24
  }, [chatData])

  const isWhatsAppChat= useMemo(()=>{
    if(!chatData) return false 

    if (chatData.platformName === 'whatsapp') {
      return true
    }

    return false
  },[chatData])

  return (
    <div
      className={cn(
        'absolute inset-0 hidden left-full z-50 w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex sm:mr-2',
        isMobileVisible && 'left-0 flex',
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

      <div className="flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0">
        {isLoading ? (
          <ChatConversationSkeleton />
        ) : (
          <ChatConversation
            messages={chatData?.messages}
            mobileSelectedChatId={mobileSelectedChatId}
          />
        )}

        <ChatFooter
          isWhatsAppChat={isWhatsAppChat}
          selectedChatId={selectedChatId}
          canSendMessage={canSendMessages}
        />
      </div>
    </div>
  )
}

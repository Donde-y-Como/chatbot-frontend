import { cn } from '@/lib/utils'
import {
  ChatConversation,
  ChatConversationSkeleton,
} from '@/features/chats/ChatConversation.tsx'
import ChatFooter from '@/features/chats/ChatFooter.tsx'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'
import {
  ConversationHeader,
  ConversationHeaderSkeleton,
} from '@/features/chats/ConversationHeader.tsx'

interface ChatContentProps {
  isLoading: boolean
  chatData?: ChatMessages
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

        <ChatFooter selectedChatId={selectedChatId} />
      </div>
    </div>
  )
}

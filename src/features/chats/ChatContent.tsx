import { useMemo } from 'react'
import { differenceInHours } from 'date-fns'
import { cn } from '@/lib/utils'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  isError?: boolean
  error?: any
  chatData: ChatMessages | undefined
  selectedChatId: string
  mobileSelectedChatId: string | null
  isMobileVisible: boolean
  onBackClick: () => void
}

export function ChatContent({
  isLoading,
  isError,
  error,
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

  // Error state component
  const ChatErrorState = () => (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-16 w-16 text-destructive/60 mb-4" />
      <h3 className="font-semibold text-lg mb-2">Chat no encontrado</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md">
        {error?.response?.status === 404 
          ? 'Este chat ya no existe o ha sido eliminado.'
          : 'Hubo un error al cargar el chat. Intenta nuevamente.'}
      </p>
      <Button variant="outline" onClick={onBackClick} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver a la lista
      </Button>
    </div>
  )

  return (
    <div
      className={cn(
        'absolute inset-0 hidden left-full z-50 w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex sm:mr-2',
        isMobileVisible && 'left-0 flex'
      )}
    >
      {/* Header Section */}
      {isError ? (
        <div className="flex-shrink-0 border-b p-4">
          <Button variant="ghost" onClick={onBackClick} className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
      ) : isLoading || !chatData || !selectedChatId ? (
        <ConversationHeaderSkeleton />
      ) : (
        <ConversationHeader
          chatData={chatData}
          selectedChatId={selectedChatId}
          onBackClick={onBackClick}
        />
      )}

      {/* Content Section */}
      <div className='flex flex-1 flex-col rounded-md overflow-hidden'>
        {isError ? (
          <div className='px-4 pb-4 pt-0'>
            <ChatErrorState />
          </div>
        ) : isLoading || !chatData ? (
          <ChatConversationSkeleton />
        ) : (
          <>
            <ChatConversation
              messages={chatData.messages}
              mobileSelectedChatId={mobileSelectedChatId}
            />
            <div className='px-4 pb-4'>
              <ChatFooter
                isWhatsAppWebChat={isWhatsAppWebChat}
                isWhatsAppChat={isWhatsAppChat}
                selectedChatId={selectedChatId}
                canSendMessage={canSendMessages}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile.tsx'
import { Main } from '@/components/layout/main'
import { ChatContent } from '@/features/chats/ChatContent'
import { chatService } from '@/features/chats/ChatService'
import EmptyChatSelectedState from '@/features/chats/EmptyChatSelectedState.tsx'
import { ChatBarUnlimited } from './chatBarUnlimited'

const route = getRouteApi('/_authenticated/chats/')

export default function Chats() {
  const searchParams = route.useSearch()
  const navigate = route.useNavigate()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [mobileSelectedChatId, setMobileSelectedChatId] = useState<
    string | null
  >(null)
  const isMobile = useIsMobile()

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
  })

  const { data: chatMessages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: () => chatService.getChatById(selectedChatId as string),
    enabled: !!selectedChatId,
  })

  useEffect(() => {
    if (chats?.length) {
      const urlChatId = searchParams.chatId
      const isValidChat = urlChatId && chats.some((c) => c.id === urlChatId)

      setSelectedChatId(isValidChat ? urlChatId : null)
      setMobileSelectedChatId(isValidChat ? urlChatId : null)
    }
  }, [chats, searchParams.chatId])

  const handleBackClick = () => {
    setMobileSelectedChatId(null)
    void navigate({
      search: () => ({ chatId: undefined }),
      replace: true,
    })
  }

  return (
    <Main fixed>
      <section className='flex h-full gap-2'>
        <ChatBarUnlimited
          navigate={navigate}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          setMobileSelectedChatId={setMobileSelectedChatId}
        />

        {selectedChatId == null && !isMobile ? (
          <EmptyChatSelectedState />
        ) : (
          <ChatContent
            isLoading={isMessagesLoading}
            chatData={chatMessages}
            selectedChatId={selectedChatId as string}
            mobileSelectedChatId={mobileSelectedChatId}
            isMobileVisible={!!mobileSelectedChatId}
            onBackClick={handleBackClick}
          />
        )}
      </section>
    </Main>
  )
}

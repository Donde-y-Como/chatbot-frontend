import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { ChatBar } from '@/features/chats/ChatBar'
import { ChatContent } from '@/features/chats/ChatContent'
import { chatService } from '@/features/chats/ChatService'

const route = getRouteApi('/_authenticated/chats/')

export default function Chats() {
  const searchParams = route.useSearch()
  const navigate = route.useNavigate()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [mobileSelectedChatId, setMobileSelectedChatId] = useState<string | null>(null)

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
      const initialChatId = isValidChat ? urlChatId : chats[0].id

      setSelectedChatId(initialChatId)
      setMobileSelectedChatId(isValidChat ? initialChatId : null)
    }
  }, [chats, searchParams.chatId])

  useEffect(() => {
    const urlChatId = searchParams.chatId
    const isMobile = window.innerWidth < 640

    if (isMobile) {
      setMobileSelectedChatId(urlChatId ? urlChatId : null)
    }
  }, [searchParams.chatId])

  const handleBackClick = () => {
    setMobileSelectedChatId(null)
    void navigate({
      search: () => ({ chatId: undefined }),
      replace: true,
    })
  }

  return (
    <Main fixed>
      <section className='flex h-full gap-6'>
        <ChatBar
          navigate={navigate}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          setMobileSelectedChatId={setMobileSelectedChatId}
        />

        <ChatContent
          isLoading={isMessagesLoading}
          chatData={chatMessages}
          selectedChatId={selectedChatId}
          mobileSelectedChatId={mobileSelectedChatId}
          isMobileVisible={!!(mobileSelectedChatId || searchParams.chatId)}
          onBackClick={handleBackClick}
        />
      </section>
    </Main>
  )
}
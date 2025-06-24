import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import { Main } from '@/components/layout/main'
import { ChatContent } from '@/features/chats/ChatContent'
import { chatService } from '@/features/chats/ChatService.ts'
import EmptyChatSelectedState from '@/features/chats/EmptyChatSelectedState'
import { ChatBarUnlimited } from './chatBarUnlimited'
import { usePaginatedChats } from './hooks/usePaginatedChats'

const route = getRouteApi('/_authenticated/chats/')

export default function Chats() {
  const searchParams = route.useSearch()
  const navigate = route.useNavigate()
  const isMobile = useIsMobile()
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [mobileSelectedChatId, setMobileSelectedChatId] = useState<string | null>(null)

  // Fetch all chats
  const { chats } = usePaginatedChats()

  // Fetch messages for selected chat
  const { 
    data: chatMessages, 
    isPending: isMessagesLoading,
    isError: isChatError,
    error: chatError 
  } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: () => {
      if (!selectedChatId) return undefined;
      return chatService.getChatById(selectedChatId)
    },
    enabled: !!selectedChatId,
    retry: (failureCount, error: any) => {
      // Don't retry if chat doesn't exist (404)
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  })

  // Handle URL sync and initial chat selection
  useEffect(() => {
    const urlChatId = searchParams.chatId
    
    // Allow navigation to any chat ID from URL, even if not in paginated list
    // This enables direct navigation from search results
    if (urlChatId) {
      setSelectedChatId(urlChatId)
      setMobileSelectedChatId(urlChatId)
    } else {
      setSelectedChatId(null)
      setMobileSelectedChatId(null)
    }
  }, [searchParams.chatId])

  // Handle back button click in mobile view
  const handleBackClick = () => {
    setMobileSelectedChatId(null)
    void navigate({
      search: () => ({ chatId: undefined }),
      replace: true,
    })
  }

  // Determine which component to show based on selection state and device type
  const showEmptyState = selectedChatId === null && !isMobile

  return (
    <Main fixed>
      <section className="flex h-full gap-2">
        <ChatBarUnlimited
          navigate={navigate}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          setMobileSelectedChatId={setMobileSelectedChatId}
        />

        {showEmptyState ? (
          <EmptyChatSelectedState />
        ) : (
          <ChatContent
            isLoading={isMessagesLoading}
            isError={isChatError}
            error={chatError}
            chatData={chatMessages}
            selectedChatId={selectedChatId || ''}
            mobileSelectedChatId={mobileSelectedChatId}
            isMobileVisible={!!mobileSelectedChatId}
            onBackClick={handleBackClick}
          />
        )}
      </section>
    </Main>
  )
}
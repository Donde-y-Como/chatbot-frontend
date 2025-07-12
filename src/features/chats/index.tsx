import React, { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import { useWebSocket } from '@/hooks/use-web-socket'
import { Main } from '@/components/layout/main'
import {
  DialogStateProvider,
  useDialogState,
} from '@/features/appointments/contexts/DialogStateContext.tsx'
import { ChatContent } from '@/features/chats/ChatContent'
import { chatService } from '@/features/chats/ChatService.ts'
import { ConnectClient } from '@/features/chats/ConnectClient.tsx'
import EmptyChatSelectedState from '@/features/chats/EmptyChatSelectedState'
import { ChatMessages, Client } from './ChatTypes'
import { ChatBarUnlimited } from './chatBarUnlimited'
import { usePaginatedChats } from './hooks/usePaginatedChats'

const route = getRouteApi('/_authenticated/chats/')

function ChatsInner() {
  const { emit } = useWebSocket()

  const searchParams = route.useSearch()
  const navigate = route.useNavigate()
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [mobileSelectedChatId, setMobileSelectedChatId] = useState<
    string | null
  >(null)

  const { isOpenConnectionClient, closeConnectionClient, selectedClientData } =
    useDialogState()

  // Fetch all chats
  const { chats } = usePaginatedChats()

  // Fetch messages for selected chat
  const {
    data: chatMessages,
    isPending: isMessagesLoading,
    isError: isChatError,
    error: chatError,
  } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: () => {
      if (!selectedChatId) return undefined
      return chatService.getChatById(selectedChatId)
    },
    enabled: !!selectedChatId,
    retry: (failureCount, error: any) => {
      // Don't retry if chat doesn't exist (404)
      if (error?.response?.status === 404) return false
      return failureCount < 2
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

  const platformId = useMemo(() => {
    const identity = chatMessages?.client.platformIdentities
      .filter((i) => i.platformName === chatMessages.platformName)
      .at(0)

    if (chatMessages?.platformName === 'whatsapp') {
      const platformId = identity?.platformId
      if (platformId) {
        const lastTenDigits = platformId.slice(-10)
        const countryCode = platformId.slice(0, -10)
        return `+${countryCode} ${lastTenDigits}`
      }
      return platformId
    }

    return identity?.platformId || ''
  }, [chatMessages])

  const currentClientData = useMemo(
    () =>
      selectedClientData || {
        id: chatMessages?.client.id,
        name: chatMessages?.client.name,
        platformName: chatMessages?.platformName,
        platformId: platformId || '',
        platformIdentities: chatMessages?.client.platformIdentities,
      },
    [
      selectedClientData,
      chatMessages?.client,
      chatMessages?.platformName,
      platformId,
    ]
  )

  const handleConnectionSuccess = async (linkedClient: Client) => {
    console.log('Successfully linked client:', linkedClient)
    if (!selectedChatId) return
    try {
      // Update the conversation in the backend to use the new client
      await chatService.updateConversation(selectedChatId, {
        clientId: linkedClient.id,
      })

      // Update the chat data in cache to use the new linked client
      queryClient.setQueryData<ChatMessages>(
        ['chat', selectedChatId],
        (oldChatData) => {
          if (!oldChatData) return oldChatData

          return {
            ...oldChatData,
            client: linkedClient,
          }
        }
      )
    } catch (error) {
      console.error('Error updating conversation client:', error)
      // The UI will still be updated optimistically, but the backend update failed
      // You might want to show a toast or handle this error differently
    }
  }
  const handleConnectionError = (error: Error) => {
    console.error('Connection error:', error)
    // Additional error handling if needed
  }

  // Determine which component to show based on selection state and device type
  const showEmptyState = selectedChatId === null && !isMobile

  return (
    <section className='flex h-full gap-2'>
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

      <ConnectClient
        isDialog={true}
        open={isOpenConnectionClient}
        onOpenChange={closeConnectionClient}
        currentClientData={currentClientData}
        conversationId={selectedClientData?.conversationId || selectedChatId}
        onConnectionSuccess={handleConnectionSuccess}
        onConnectionError={handleConnectionError}
        onEmitSocketEvent={emit}
      />
    </section>
  )
}

export default function Chats() {
  return (
    <Main fixed>
      <DialogStateProvider>
        <ChatsInner />
      </DialogStateProvider>
    </Main>
  )
}

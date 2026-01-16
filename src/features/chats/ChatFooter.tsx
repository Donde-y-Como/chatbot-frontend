import {
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { IconSend } from '@tabler/icons-react'
import { uid } from 'uid'
import { sortByLastMessageTimestamp } from '@/lib/utils.ts'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Button } from '@/components/ui/button.tsx'
import { Textarea } from '@/components/ui/textarea'
import {
  ChatMessages,
  ChatResponse,
  Message,
} from '@/features/chats/ChatTypes.ts'
import type { OutgoingMedia } from '@/features/chats/ChatTypes.ts'
import { MediaUpload } from '@/features/chats/MediaUpload.tsx'
import { EmojiPickerButton } from '@/features/chats/components/EmojiPickerButton'
import { QuickResponseDropdown } from './ChatConversation.tsx'
import ExpiredChatTemplates from './ExpiredChatTemplates'
import { useQuickResponsesForChat } from './hooks/useQuickResponsesForChat'
import { QuickResponsePreview } from '@/features/chats/components/QuickResponsePreview'
import { useQuickResponseStash } from '@/features/chats/hooks/useQuickResponseStash'
import { DefaultMessageSenderService } from '@/features/chats/services/MessageSenderService'

const ChatFooter = memo(
  ({
    isWhatsAppChat,
    isWhatsAppWebChat,
    selectedChatId,
    canSendMessage,
  }: {
    isWhatsAppChat: boolean
    isWhatsAppWebChat: boolean
    selectedChatId: string
    canSendMessage: boolean
  }) => {
    const queryClient = useQueryClient()
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isSendingQuickResponseBatch, setIsSendingQuickResponseBatch] =
      useState(false)
    const isSendingQuickResponseBatchRef = useRef(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {
      isDropdownOpen,
      searchTerm,
      filteredResponses,
      isLoading,
      selectedIndex,
      processInput,
      closeDropdown,
      handleKeyNavigation,
      getSelectedResponse,
      setSelectedResponseIndex,
    } = useQuickResponsesForChat()

    const {
      quickResponse: stashedQuickResponse,
      isStashed,
      stashQuickResponse,
      clearStash,
      getStashedBatch,
    } = useQuickResponseStash()

    const messageSenderService = useMemo(
      () => new DefaultMessageSenderService(),
      []
    )

    const adjustTextareaHeight = useCallback((element: HTMLTextAreaElement) => {
      element.style.height = '0'
      element.style.height = `${Math.min(element.scrollHeight, 128)}px`
    }, [])

    useEffect(() => {
      if (textareaRef.current) {
        adjustTextareaHeight(textareaRef.current)
      }
    }, [adjustTextareaHeight])

    useEffect(() => {
      if (newMessage === '' && textareaRef.current) {
        textareaRef.current.style.height = '32px'
      }
    }, [newMessage])

    const { sendMessage: sendToWebSocket } = useWebSocket()
    const sendMessageMutation = useMutation({
      mutationKey: ['send-message'],
      async mutationFn(data: { conversationId: string; message: Message }) {
        try {
          sendToWebSocket(data)
          return data
        } catch (error) {
          console.error('Failed to send message:', error)
          throw error
        }
      },
      onMutate: () => {
        setIsSending(true)
      },
      onSuccess: async (_data, variables) => {
        queryClient.setQueryData<ChatMessages>(
          ['chat', selectedChatId],
          (oldChats) => {
            if (oldChats === undefined) return oldChats
            return {
              ...oldChats,
              messages: [...oldChats.messages, variables.message],
            }
          }
        )

        queryClient.setQueryData<InfiniteData<ChatResponse>>(
          ['chats'],
          (cachedData) => {
            if (!cachedData) return cachedData

            const modifiedPages = cachedData.pages.map((page) => {
              const modifiedConversations = page.conversations.map((chat) => {
                if (chat.id === selectedChatId) {
                  return {
                    ...chat,
                    lastMessage: variables.message,
                    newClientMessagesCount: 0,
                  }
                }
                return chat
              })

              return {
                ...page,
                conversations: modifiedConversations.sort(
                  sortByLastMessageTimestamp
                ),
              }
            })

            return {
              ...cachedData,
              pages: modifiedPages,
            }
          }
        )
      },
      onError: (error, variables) => {
        console.error('Message send error:', error)
        toast.error('Error al enviar mensaje. Inténtalo de nuevo.')
        
        // Restore the message in the input on error
        setNewMessage(variables.message.content)
        
        // Remove the optimistically added message from cache
        queryClient.setQueryData<ChatMessages>(
          ['chat', selectedChatId],
          (oldChats) => {
            if (oldChats === undefined) return oldChats
            return {
              ...oldChats,
              messages: oldChats.messages.filter(msg => msg.id !== variables.message.id),
            }
          }
        )
      },
      onSettled: () => {
        setIsSending(false)
      },
    })

    const { mutate: mutateSendMessage } = sendMessageMutation

    const handleSendMessage = useCallback((e: FormEvent) => {
      e.preventDefault()
      
      const trimmedMessage = newMessage.trim()
      if (!trimmedMessage || isSending) return

      const newMsg = messageSenderService.createTextMessage(trimmedMessage)

      // Clear input immediately for better UX
      setNewMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '32px'
      }

      mutateSendMessage({
        conversationId: selectedChatId,
        message: newMsg,
      })
    }, [newMessage, isSending, messageSenderService, mutateSendMessage, selectedChatId])

    const handleMediaSend = useCallback(
      (media: OutgoingMedia) => {
        if (isSending) {
          toast.error('Espera a que se envíe el mensaje anterior')
          return
        }

        const newMsg = messageSenderService.createMediaMessage(media)

        mutateSendMessage({
          conversationId: selectedChatId,
          message: newMsg,
        })
      },
      [selectedChatId, mutateSendMessage, isSending, messageSenderService]
    )

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setNewMessage(value)
        adjustTextareaHeight(e.target)
        processInput(value)
      },
      [adjustTextareaHeight, processInput]
    )

    const handleSelectQuickResponse = useCallback(
      (message: string, quickResponse?: any) => {
        // If the quick response has media, stash it for preview
        if (quickResponse && quickResponse.medias && quickResponse.medias.length > 0) {
          stashQuickResponse(quickResponse)
          closeDropdown()
          setNewMessage('')
          if (textareaRef.current) {
            textareaRef.current.style.height = '32px'
          }
        } else {
          // Normal text-only quick response
          setNewMessage(message)
          closeDropdown()

          if (textareaRef.current) {
            textareaRef.current.focus()
            adjustTextareaHeight(textareaRef.current)
          }
        }
      },
      [closeDropdown, adjustTextareaHeight, stashQuickResponse]
    )

    const handleSendQuickResponseBatch = useCallback(async () => {
      const batch = getStashedBatch()
      if (
        !batch ||
        batch.messages.length === 0 ||
        isSending ||
        isSendingQuickResponseBatchRef.current
      )
        return

      isSendingQuickResponseBatchRef.current = true
      setIsSendingQuickResponseBatch(true)

      try {
        // Send messages sequentially to maintain order
        for (const message of batch.messages) {
          await new Promise<void>((resolve, reject) => {
            mutateSendMessage(
              {
                conversationId: selectedChatId,
                message,
              },
              {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
              }
            )
          })
          // Small delay between messages to ensure proper ordering
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        clearStash()
      } catch (error) {
        console.error('Failed to send quick response batch:', error)
        toast.error('Error al enviar la respuesta rápida')
      } finally {
        isSendingQuickResponseBatchRef.current = false
        setIsSendingQuickResponseBatch(false)
      }
    }, [getStashedBatch, isSending, mutateSendMessage, selectedChatId, clearStash])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isDropdownOpen) {
          const wasHandled = handleKeyNavigation(e)

          if (
            e.key === 'Enter' &&
            !e.shiftKey &&
            filteredResponses.length > 0
          ) {
            e.preventDefault()
            const selectedResponse = getSelectedResponse()

            if (selectedResponse) {
              handleSelectQuickResponse(selectedResponse.content, selectedResponse)
            } else if (filteredResponses.length > 0 && selectedIndex === null) {
              handleSelectQuickResponse(filteredResponses[0].content, filteredResponses[0])
            }
            return
          }

          if (e.key === 'Escape') {
            e.preventDefault()
            closeDropdown()
            return
          }

          if (wasHandled) return
        }

        if (e.key === 'Enter' && !e.shiftKey && !isDropdownOpen) {
          e.preventDefault()
          handleSendMessage(e)
        }
      },
      [
        isDropdownOpen,
        handleKeyNavigation,
        filteredResponses,
        getSelectedResponse,
        selectedIndex,
        handleSelectQuickResponse,
        closeDropdown,
        handleSendMessage,
      ]
    )

    const handleEmojiSelect = useCallback(
      (emoji: { emoji: string }) => {
        setNewMessage((prev) => prev + emoji.emoji)
        if (textareaRef.current) {
          adjustTextareaHeight(textareaRef.current)
          textareaRef.current.focus()
        }
      },
      [adjustTextareaHeight]
    )

    return (
      <div className='flex w-full flex-none flex-col gap-2'>
        {/* Quick Response Preview */}
        {isStashed && stashedQuickResponse && (
          <QuickResponsePreview
            quickResponse={stashedQuickResponse}
            onSend={handleSendQuickResponseBatch}
            onCancel={clearStash}
            isLoading={isSending || isSendingQuickResponseBatch}
          />
        )}
        
        <form
          onSubmit={handleSendMessage}
          className='flex w-full items-end gap-2'
        >
          <div className='flex flex-1 items-end gap-2 rounded-2xl border border-input bg-background px-2 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring lg:gap-3'>
            {canSendMessage ? (
              <>
                <div className='flex items-center gap-1'>
                  <MediaUpload onSend={handleMediaSend} />
                  <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                </div>

                <div className='relative flex-1'>
                  <Textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder='Escribe tu mensaje o usa "/" para respuestas rápidas'
                    className='min-h-9 max-h-32 w-full resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    value={newMessage}
                    onKeyDown={handleKeyDown}
                    onChange={handleInputChange}
                    disabled={isSending}
                  />

                  <QuickResponseDropdown
                    isOpen={isDropdownOpen}
                    onClose={closeDropdown}
                    onSelectResponse={handleSelectQuickResponse}
                    searchTerm={searchTerm}
                    selectedIndex={selectedIndex}
                    responses={filteredResponses}
                    isLoading={isLoading}
                    anchorRef={textareaRef}
                    onSelectionChange={setSelectedResponseIndex}
                  />
                </div>

                <Button
                  type='submit'
                  size='icon'
                  className='shrink-0'
                  disabled={!newMessage.trim() || isSending}
                  aria-label='Enviar mensaje'
                >
                  {isSending ? (
                    <div className='animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full' />
                  ) : (
                    <IconSend size={18} />
                  )}
                </Button>
              </>
            ) : (
              <div className='w-full'>
                {isWhatsAppChat ? (
                  <ExpiredChatTemplates selectedChatId={selectedChatId} />
                ) : isWhatsAppWebChat ? (
                  <div className='text-sm opacity-60 italic p-2 flex items-center gap-2'>
                    <p>Conecta tu whatsapp web para enviar mensajes</p>
                    <Link
                      to='/settings/whatsapp'
                      className='text-sm font-medium underline not-italic'
                    >
                      Conectar
                    </Link>
                  </div>
                ) : (
                  <p className='text-sm opacity-60 italic p-2'>
                    Esta conversación debe ser iniciada por el cliente.
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    )
  }
)

export default ChatFooter

import {
  FormEvent,
  memo,
  useCallback,
  useEffect,
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
import {
  ChatMessages,
  ChatResponse,
  Message,
} from '@/features/chats/ChatTypes.ts'
import { MediaUpload } from '@/features/chats/MediaUpload.tsx'
import { EmojiPickerButton } from '@/features/chats/components/EmojiPickerButton'
import { QuickResponseDropdown } from './ChatConversation.tsx'
import ExpiredChatTemplates from './ExpiredChatTemplates'
import { useQuickResponsesForChat } from './hooks/useQuickResponsesForChat'

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

    const handleSendMessage = useCallback((e: FormEvent) => {
      e.preventDefault()
      
      const trimmedMessage = newMessage.trim()
      if (!trimmedMessage || isSending) return

      const newMsg: Message = {
        id: uid(),
        content: trimmedMessage,
        role: 'business',
        timestamp: Date.now(),
        media: null,
      }

      // Clear input immediately for better UX
      setNewMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '32px'
      }

      sendMessageMutation.mutate({
        conversationId: selectedChatId,
        message: newMsg,
      })
    }, [newMessage, isSending, selectedChatId, sendMessageMutation.mutate])

    const handleMediaSend = useCallback(
      (media: {
        type: 'image' | 'video' | 'audio' | 'document'
        url: string
      }) => {
        if (isSending) {
          toast.error('Espera a que se envíe el mensaje anterior')
          return
        }

        const newMsg: Message = {
          id: uid(),
          content: '',
          role: 'business',
          timestamp: Date.now(),
          media: {
            type: media.type,
            url: media.url,
          },
        }

        sendMessageMutation.mutate({
          conversationId: selectedChatId,
          message: newMsg,
        })
      },
      [selectedChatId, sendMessageMutation.mutate, isSending]
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
      (message: string) => {
        setNewMessage(message)
        closeDropdown()

        if (textareaRef.current) {
          textareaRef.current.focus()
          adjustTextareaHeight(textareaRef.current)
        }
      },
      [closeDropdown, adjustTextareaHeight]
    )

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
              handleSelectQuickResponse(selectedResponse.content)
            } else if (filteredResponses.length > 0 && selectedIndex === null) {
              handleSelectQuickResponse(filteredResponses[0].content)
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
      <form
        onSubmit={handleSendMessage}
        className='flex w-full flex-none gap-2'
      >
        <div className='flex flex-1 items-start gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
          {canSendMessage ? (
            <>
              <div className='self-center flex items-center gap-1'>
                <MediaUpload onSend={handleMediaSend} />
                <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
              </div>

              <div className='relative flex-1'>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder='Escribe tu mensaje o usa "/" para respuestas rápidas'
                  className='h-8 min-h-8 max-h-32 w-full bg-inherit resize-none overflow-y-auto md:pt-1.5 pt-1 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
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

              <div className='self-center'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='hidden sm:inline-flex'
                  type='submit'
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <div className='animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full' />
                  ) : (
                    <IconSend size={20} />
                  )}
                </Button>
              </div>
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
        <Button 
          className='self-start h-10 sm:hidden' 
          type='submit'
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <div className='animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full' />
          ) : (
            <IconSend size={18} />
          )}
        </Button>
      </form>
    )
  }
)

export default ChatFooter

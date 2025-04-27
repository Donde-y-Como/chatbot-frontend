import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconSend } from '@tabler/icons-react'
import { uid } from 'uid'
import { sortByLastMessageTimestamp } from '@/lib/utils.ts'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Button } from '@/components/ui/button.tsx'
import { Chat, ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import { MediaUpload } from '@/features/chats/MediaUpload.tsx'
import { EmojiPickerButton } from '@/features/chats/components/EmojiPickerButton'
import { QuickResponseDropdown } from './ChatConversation.tsx'
import { useQuickResponsesForChat } from './hooks/useQuickResponsesForChat'

const ChatFooter = memo(
  ({
    selectedChatId,
    canSendMessage,
  }: {
    selectedChatId: string
    canSendMessage: boolean
  }) => {
    const [newMessage, setNewMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Use the custom hook for quick responses
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
      ensureItemVisible,
    } = useQuickResponsesForChat()

    const adjustTextareaHeight = useCallback((element: HTMLTextAreaElement) => {
      element.style.height = '0'
      element.style.height = `${Math.min(element.scrollHeight, 128)}px` // 128px is equivalent to max-h-32
    }, [])

    useEffect(() => {
      if (textareaRef.current) {
        adjustTextareaHeight(textareaRef.current)
      }
    }, [adjustTextareaHeight])

    // Reset height when message is sent
    useEffect(() => {
      if (newMessage === '' && textareaRef.current) {
        textareaRef.current.style.height = '32px' // reset to h-8
      }
    }, [newMessage])

    const queryClient = useQueryClient()
    const { sendMessage: sendToWebSocket } = useWebSocket()
    const sendMessageMutation = useMutation({
      mutationKey: ['send-message'],
      async mutationFn(data: { conversationId: string; message: Message }) {
        sendToWebSocket(data)
      },
      onSuccess: (_data, variables) => {
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

        queryClient.setQueryData<Chat[]>(['chats'], (oldChats) => {
          if (oldChats === undefined) return oldChats

          return [...oldChats]
            .map((chat) => {
              if (chat.id === variables.conversationId) {
                return {
                  ...chat,
                  lastMessage: variables.message,
                }
              }
              return chat
            })
            .sort(sortByLastMessageTimestamp)
        })
      },
    })

    const handleSendMessage = useCallback(
      (e: FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const newMsg: Message = {
          id: uid(),
          content: newMessage.trim(),
          role: 'business',
          timestamp: Date.now(),
          media: null,
        }

        setNewMessage('')
        sendMessageMutation.mutate({
          conversationId: selectedChatId,
          message: newMsg,
        })
      },
      [newMessage, selectedChatId, sendMessageMutation]
    )

    const handleMediaSend = useCallback(
      (media: {
        type: 'image' | 'video' | 'audio' | 'document'
        url: string
      }) => {
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
      [selectedChatId, sendMessageMutation]
    )

    // Handle input change with quick response functionality
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setNewMessage(value)
        adjustTextareaHeight(e.target)

        // Process input for quick responses
        processInput(value)
      },
      [adjustTextareaHeight, processInput]
    )

    // Handle selection of a quick response
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

    // Handle keyboard navigation for quick responses
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // If dropdown is open, handle navigation
        if (isDropdownOpen) {
          // Handle special keys for navigation
          const wasHandled = handleKeyNavigation(e)

          // If Enter was pressed and there are results, select the current item
          if (
            e.key === 'Enter' &&
            !e.shiftKey &&
            filteredResponses.length > 0
          ) {
            e.preventDefault()
            const selectedResponse = getSelectedResponse()

            if (selectedResponse) {
              // If an item is already selected, use it
              handleSelectQuickResponse(selectedResponse.message)
            } else if (filteredResponses.length > 0 && selectedIndex === null) {
              // If no item is selected yet but we have responses, use the first one
              // This makes the UX more intuitive - pressing Enter without arrow keys selects the first item
              handleSelectQuickResponse(filteredResponses[0].message)
            }
            return
          }

          // If Escape was pressed, close the dropdown
          if (e.key === 'Escape') {
            e.preventDefault()
            closeDropdown()
            return
          }

          // If the key was handled by navigation, don't proceed
          if (wasHandled) return
        }

        // Normal handling for Enter to send message
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

    // Handle emoji selection with memoized callback
    const handleEmojiSelect = useCallback(
      (emoji) => {
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
                  className='h-8 min-h-8 max-h-32 w-full bg-inherit resize-none overflow-y-auto md:pt-1.5 pt-1 focus-visible:outline-none'
                  value={newMessage}
                  onKeyDown={handleKeyDown}
                  onChange={handleInputChange}
                />

                {/* Quick Response Dropdown */}
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
                >
                  <IconSend size={20} />
                </Button>
              </div>
            </>
          ) : (
            <p className='text-sm opacity-60 italic'>
              No puedes enviar mensajes a esta conversación
            </p>
          )}
        </div>
        <Button className='self-start h-10 sm:hidden' type='submit'>
          <IconSend size={18} />
        </Button>
      </form>
    )
  }
)

export default ChatFooter

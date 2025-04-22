import { FormEvent, useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconSend } from '@tabler/icons-react'
import { uid } from 'uid'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Button } from '@/components/ui/button.tsx'
import { Chat, ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import { MediaUpload } from '@/features/chats/MediaUpload.tsx'
import { EmojiPickerButton } from '@/features/chats/components/EmojiPickerButton'
import { sortByLastMessageTimestamp } from '@/lib/utils.ts'

export default function ChatFooter({
  selectedChatId,
  canSendMessage,
}: {
  selectedChatId: string
  canSendMessage: boolean
}) {
  const [newMessage, setNewMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = '0'
    element.style.height = `${Math.min(element.scrollHeight, 128)}px` // 128px is equivalent to max-h-32
  }

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current)
    }
  }, [])

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

  const handleSendMessage = (e: FormEvent) => {
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
  }

  const handleMediaSend = (media: {
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
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSendMessage(e)
      }}
      className='flex w-full flex-none gap-2'
    >
      <div className='flex flex-1 items-start gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
        {canSendMessage ? (
          <>
            <div className='self-center flex items-center gap-1'>
              <MediaUpload onSend={handleMediaSend} />
              <EmojiPickerButton
                onEmojiSelect={(emoji) => {
                  setNewMessage((prev) => prev + emoji.emoji)
                  if (textareaRef.current) {
                    adjustTextareaHeight(textareaRef.current)
                    textareaRef.current.focus()
                  }
                }}
              />
            </div>

            <textarea
              ref={textareaRef}
              rows={1}
              placeholder='Escribe tu mensaje...'
              className='h-8 min-h-8 max-h-32 w-full bg-inherit resize-none overflow-y-auto md:pt-1.5 pt-1 focus-visible:outline-none'
              value={newMessage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              onChange={(e) => {
                setNewMessage(e.target.value)
                adjustTextareaHeight(e.target)
              }}
            />
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

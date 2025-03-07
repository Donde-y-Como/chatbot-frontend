import { FormEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconSend } from '@tabler/icons-react'
import { uid } from 'uid'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Button } from '@/components/ui/button.tsx'
import { Chat, ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import { MediaUpload } from '@/features/chats/MediaUpload.tsx'

export default function ChatFooter({ selectedChatId, canSendMessage }: {
  selectedChatId: string
  canSendMessage: boolean
}) {
  const [newMessage, setNewMessage] = useState('')
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
          .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp)
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
      <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
        {canSendMessage ? (
          <>
            <MediaUpload onSend={handleMediaSend} />

            <input
              type='text'
              placeholder='Escribe tu mensaje...'
              className='h-8 w-full bg-inherit focus-visible:outline-none'
              value={newMessage}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button
              variant='ghost'
              size='icon'
              className='hidden sm:inline-flex'
              type='submit'
            >
              <IconSend size={20} />
            </Button>
          </>
        ) : <p className='text-sm opacity-60 italic'>No puedes enviar mensajes a esta conversación</p>}
      </div>
      <Button className='h-full sm:hidden' type='submit'>
        <IconSend size={18} />
      </Button>
    </form>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { AvatarImage } from '@radix-ui/react-avatar'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { Check, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn, sortByLastMessageTimestamp } from '@/lib/utils'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input.tsx'
import { Chat, ChatMessages } from '@/features/chats/ChatTypes'
import { AddTagsModal } from './components/AddTagsModal'
import { useChatMutations } from './hooks/useChatMutations'
import { useUpdateClientTags } from './hooks/useUpdateClientTags'

interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const { emit } = useWebSocket()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(chat.client?.name || 'Unknown')
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { markAsUnread } = useChatMutations()
  const updateProfileNameMutation = useMutation({
    mutationKey: ['set-profile-name'],
    async mutationFn(data: { clientId: string; profileName: string }) {
      emit('setProfileName', data)
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(
        ['chat', chat.id],
        (cachedConversation: ChatMessages) => {
          return {
            ...cachedConversation,
            client: cachedConversation.client
              ? {
                  ...cachedConversation.client,
                  name: variables.profileName,
                }
              : undefined,
          }
        }
      )

      queryClient.setQueryData<Chat[]>(['chats'], (oldChats) => {
        if (oldChats === undefined) return []

        return [...oldChats]
          .map((cachedChat) => {
            if (cachedChat.id === chat.id && cachedChat.client) {
              return {
                ...cachedChat,
                client: {
                  ...cachedChat.client,
                  name: variables.profileName,
                },
              }
            }
            return cachedChat
          })
          .sort(sortByLastMessageTimestamp)
      })
    },
  })

  const lastMsg = chat.lastMessage ? (
    chat.lastMessage.role === 'business' ? (
      <span>
        <Check className='inline-block h-3 w-3 mr-1 opacity-80' />
        Tú: {chat.lastMessage.content}
      </span>
    ) : chat.lastMessage.role === 'assistant' ? (
      <span>
        <Check className='inline-block w-3 mr-0.5 opacity-80' />
        Asistente: {chat.lastMessage.content}
      </span>
    ) : (
      chat.lastMessage.content
    )
  ) : (
    <span className='text-muted-foreground italic'>Sin mensajes</span>
  )

  const PlatformIcon = {
    whatsappWeb: IconBrandWhatsapp,
    whatsapp: IconBrandWhatsapp,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
  }[chat.platformName.toLowerCase()]

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleNameChange = async (newName: string) => {
    try {
      if (!chat.client) {
        setIsEditing(false)
        return
      }

      if (!newName.trim() || newName === chat.client.name) {
        setTempName(chat.client.name)
        setIsEditing(false)
        return
      }

      updateProfileNameMutation.mutate({
        clientId: chat.client.id,
        profileName: tempName,
      })

      setIsEditing(false)
      setTempName(tempName)

      toast.success('Nombre de perfil actualizado')
    } catch (error) {
      toast.error('El nombre de perfil no se actualizó!')
      setTempName(chat.client?.name || 'Unknown')
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tempName.trim()) {
      void handleNameChange(tempName)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setTempName(chat.client?.name || 'Unknown')
    }
    e.stopPropagation()
  }

  const handleBlur = () => {
    void handleNameChange(tempName)
  }

  const handleMarkAsUnread = () => {
    markAsUnread(chat.id)
  }

  const [isAddTagsModalOpen, setIsAddTagsModalOpen] = useState(false)
  const { updateClientTags } = useUpdateClientTags()

  const handleAddTags = async (tagIds: string[]) => {
    if (chat.client) {
      await updateClientTags(chat.client.id, tagIds)
    }
  }

  const clientInitial = chat.client?.name?.[0] || '?'
  const hasPhoto = chat.client?.photo && chat.client.photo.length > 0

  return (
    <div
      className={cn(
        'flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75 cursor-pointer',
        isSelected && 'sm:bg-muted'
      )}
      onClick={onClick}
    >
      <div className='flex gap-2 w-full'>
        <div className='relative flex-shrink-0'>
          <Avatar>
            {hasPhoto && (
              <AvatarImage
                src={chat.client?.photo}
                alt={chat.client?.name || 'Unknown'}
                className='object-cover w-full'
              />
            )}
            <AvatarFallback>{clientInitial}</AvatarFallback>
          </Avatar>
          {PlatformIcon && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md'>
              <PlatformIcon
                size={14}
                className={cn(
                  (chat.platformName.toLowerCase() === 'whatsapp' ||
                    chat.platformName.toLowerCase() === 'whatsappWeb') &&
                    'text-green-500',
                  chat.platformName.toLowerCase() === 'facebook' &&
                    'text-blue-500',
                  chat.platformName.toLowerCase() === 'instagram' &&
                    'text-pink-500'
                )}
              />
            </div>
          )}
        </div>
        <div className='font-medium w-full grid grid-cols-5 gap-y-0.5'>
          <span className='col-span-4'>
            {isEditing ? (
              <div onClick={(e) => e.stopPropagation()}>
                <Input
                  ref={inputRef}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className='h-6 py-0 px-1'
                />
              </div>
            ) : (
              chat.client?.name || 'Unknown'
            )}
          </span>

          <span className='col-span-1 text-xs text-right font-normal text-muted-foreground'>
            {/* Timestamp code remains the same */}
          </span>

          <span className='col-span-4 text-sm text-muted-foreground truncate'>
            {lastMsg}
          </span>

          <span className='col-span-1 flex justify-end'>
            {chat.newClientMessagesCount > 0 ? (
              <span className='min-w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs'>
                {chat.newClientMessagesCount}
              </span>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant='ghost'
                    className='h-6 w-6 p-0 hover:bg-muted'
                  >
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-44'>
                  {chat.client ? (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditing(true)
                        }}
                      >
                        Cambiar nombre
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsUnread()
                        }}
                      >
                        Marcar como no leido
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsAddTagsModalOpen(true)
                        }}
                      >
                        Agregar etiqueta
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled>
                      No hay cliente asociado
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </span>
        </div>
      </div>
      {chat.client && (
        <AddTagsModal
          open={isAddTagsModalOpen}
          setOpen={setIsAddTagsModalOpen}
          client={chat.client}
          onSave={handleAddTags}
        />
      )}
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { es } from 'date-fns/locale/es'
import { Check, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
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
//import { Switch } from '@/components/ui/switch.tsx'
import { Chat, ChatMessages } from '@/features/chats/ChatTypes'
import { toast } from 'sonner'

interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const { emit } = useWebSocket()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(chat.client.profileName)
  // const [isAIEnabled, setIsAIEnabled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const updateProfileNameMutation = useMutation({
    mutationKey: ['send-message'],
    async mutationFn(data: { clientId: string; profileName: string }) {
      emit('setProfileName', data)
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<ChatMessages>(['chat', chat.id], (oldChats) => {
        if (oldChats === undefined) return oldChats
        return {
          ...oldChats,
          client: {
            ...oldChats.client,
            profileName: variables.profileName,
          },
        }
      })

      queryClient.setQueryData<Chat[]>(['chats'], (oldChats) => {
        if (oldChats === undefined) return oldChats
        return [...oldChats]
          .map((cachedChat) => {
            if (cachedChat.id === chat.id) {
              return {
                ...cachedChat,
                client: {
                  ...cachedChat.client,
                  profileName: variables.profileName,
                },
              }
            }
            return cachedChat
          })
          .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp)
      })
    },
  })

  const lastMsg =
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

  const PlatformIcon = {
    whatsapp: IconBrandWhatsapp,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
  }[chat.platformName.toLowerCase()]

  const handleNameChange = async (newName: string) => {
    try {
      if (!newName.trim() || newName === chat.client.profileName) {
        setTempName(chat.client.profileName)
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
      setTempName(chat.client.profileName)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tempName.trim()) {
      void handleNameChange(tempName)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setTempName(chat.client.profileName)
    }
    e.stopPropagation()
  }

  const handleBlur = () => {
    void handleNameChange(tempName)
  }

  // const handleAIToggle = async () => {
  //   try {
  //     const newState = !isAIEnabled
  //     // Here you would call your API to update AI state
  //     console.log('Toggling AI to:', newState)
  //     setIsAIEnabled(newState)
  //   } catch (error) {
  //     console.error('Failed to toggle AI:', error)
  //   }
  // }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

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
            <AvatarFallback>{chat.client.profileName[0] || ''}</AvatarFallback>
          </Avatar>
          {PlatformIcon && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md'>
              <PlatformIcon
                size={14}
                className={cn(
                  chat.platformName.toLowerCase() === 'whatsapp' &&
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
              chat.client.profileName || 'Desconocido'
            )}
          </span>

          <span className='col-span-1 text-xs text-right font-normal text-muted-foreground'>
            {formatDistanceToNowStrict(new Date(chat.lastMessage.timestamp), {
              addSuffix: false,
              locale: es,
            })}
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
                      // Handle profile view
                    }}
                  >
                    Ver perfil
                  </DropdownMenuItem>
                  {/*<DropdownMenuItem*/}
                  {/*  className='flex justify-between'*/}
                  {/*  onClick={(e) => e.stopPropagation()}*/}
                  {/*>*/}
                  {/*  <span>IA {isAIEnabled ? 'Encendida' : 'Apagada'}</span>*/}
                  {/*  <Switch*/}
                  {/*    checked={isAIEnabled}*/}
                  {/*    onCheckedChange={handleAIToggle}*/}
                  {/*    className='ml-2'*/}
                  {/*  />*/}
                  {/*</DropdownMenuItem>*/}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

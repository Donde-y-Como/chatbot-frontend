import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input.tsx'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { cn } from '@/lib/utils'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNowStrict, format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Check, MoreVertical } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
//import { Switch } from '@/components/ui/switch.tsx'
import { Chat, ChatMessages } from '@/features/chats/ChatTypes'
import { AvatarImage } from '@radix-ui/react-avatar'
import { toast } from 'sonner'
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
  const [tempName, setTempName] = useState(chat.client.name)
  // const [isAIEnabled, setIsAIEnabled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { markAsUnread } = useChatMutations()
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
            name: variables.profileName,
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
                  name: variables.profileName,
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleNameChange = async (newName: string) => {
    try {
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
      setTempName(chat.client.name)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tempName.trim()) {
      void handleNameChange(tempName)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setTempName(chat.client.name)
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

  const handleMarkAsUnread = () => {
    markAsUnread(chat.id);
  };

  const [isAddTagsModalOpen, setIsAddTagsModalOpen] = useState(false);
  const { updateClientTags, isLoading: isUpdateClientTagsLoading } = useUpdateClientTags();

  const handleAddTags = (tagIds: string[]) => {
    updateClientTags(chat.client.id, tagIds);
  };

  return (
    <div
      className={cn(
        "flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75 cursor-pointer",
        isSelected && 'sm:bg-muted'
      )}
      onClick={onClick}
    >
      <div className='flex gap-2 w-full'>
        <div className='relative flex-shrink-0'>
          <Avatar>
            {chat.client.photo.length > 0 && <AvatarImage src={chat.client.photo} alt={chat.client.name} className="object-cover w-full" />}
            <AvatarFallback>{chat.client.name[0]}</AvatarFallback>
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
              chat.client.name
            )}
          </span>

          <span className='col-span-1 text-xs text-right font-normal text-muted-foreground'>
            {(() => {
              // Hotfix for invalid timestamp
              const messageDate = (() => {
                try {
                  // First check if the timestamp exists
                  if (!chat.lastMessage?.timestamp) {
                    console.warn('Missing timestamp in chat:', { 
                      chatId: chat.id, 
                      clientName: chat.client.name 
                    });
                    return new Date(); // Fallback to current date if no timestamp
                  }
                  
                  // Try to create a valid date
                  const timestamp = chat.lastMessage.timestamp;
                  
                  // Enhanced debugging - log both value and chat details
                  console.log('Processing timestamp:', {
                    timestamp,
                    type: typeof timestamp,
                    chatId: chat.id,
                    clientName: chat.client.name,
                    lastMessageContent: chat.lastMessage.content?.substring(0, 20) + '...',
                    platformName: chat.platformName
                  });
                  
                  // If timestamp is a number, handle it directly
                  const date = typeof timestamp === 'number' 
                    ? new Date(timestamp) 
                    : new Date(String(timestamp));
                  
                  // Check if the date is valid
                  if (isNaN(date.getTime())) {
                    console.error('❌ Invalid timestamp detected:', {
                      timestamp,
                      chatId: chat.id,
                      clientName: chat.client.name,
                      platformName: chat.platformName
                    });
                    return new Date(); // Fallback to current date
                  }
                  
                  return date;
                } catch (error) {
                  console.error('❌ Error parsing timestamp:', {
                    error,
                    chatId: chat.id,
                    clientName: chat.client.name,
                    timestamp: chat.lastMessage?.timestamp
                  });
                  return new Date(); // Fallback to current date
                }
              })();
              const daysDifference = differenceInDays(new Date(), messageDate);
              
              if (daysDifference > 2) {
                return format(messageDate, 'dd/MM/yy');
              } else if (daysDifference === 1) {
                return 'ayer';
              } else if (daysDifference === 2) {
                return 'anteayer';
              } else {
                return formatDistanceToNowStrict(messageDate, {
                  addSuffix: false,
                  locale: es,
                });
              }
            })()}
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
                      handleMarkAsUnread()
                    }}
                  >
                    Marcar como no leido
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAddTagsModalOpen(true);
                    }}
                  >
                    Agregar etiqueta
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
      <AddTagsModal
        open={isAddTagsModalOpen}
        setOpen={setIsAddTagsModalOpen}
        client={chat.client}
        onSave={handleAddTags}
      />
    </div>
  )
}

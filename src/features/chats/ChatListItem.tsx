import React, { useEffect, useMemo, useRef, useState } from 'react';
import { differenceInDays, format, formatDistanceToNowStrict } from 'date-fns';
import { AvatarImage } from '@radix-ui/react-avatar';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';
import { es } from 'date-fns/locale/es';
import { Check, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/api/permissions.ts';
import { RenderIfCan } from '@/lib/Can.tsx';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/use-web-socket.ts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input.tsx';
import { WhatsAppBusinessIcon } from '@/components/ui/whatsAppBusinessIcon.tsx';
import { useDialogState } from '@/features/appointments/contexts/DialogStateContext.tsx';
import { Chat, ChatMessages, ChatResponse } from '@/features/chats/ChatTypes';
import { RemoveChatConfirmationModal } from '@/features/chats/components/RemoveChatConfirmationModal.tsx';
import { useClients } from '@/features/clients/context/clients-context.tsx';
import { AddTagsModal } from './components/AddTagsModal';
import { useChatMutations } from './hooks/useChatMutations';
import { useUpdateClientTags } from './hooks/useUpdateClientTags';


interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
  isChecked?: boolean
  onToggleCheck?: () => void
}

const route = getRouteApi('/_authenticated/chats/')

export function ChatListItem({
  chat,
  isSelected,
  onClick,
  isChecked = false,
  onToggleCheck,
}: ChatListItemProps) {
  const { openConnectionClient } = useDialogState()
  const { emit } = useWebSocket()
  const navigate = route.useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(chat.client?.name || 'Unknown')
  const [shouldHighlight, setShouldHighlight] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { markAsUnread, remove } = useChatMutations()
  const { setOpen, setCurrentRow } = useClients()
  const updateProfileNameMutation = useMutation({
    mutationKey: ['set-profile-name'],
    async mutationFn(data: { clientId: string; profileName: string }) {
      emit('setProfileName', data)
    },
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<ChatMessages>(
        ['chat', chat.id],
        (cachedConversation) => {
          if (!cachedConversation) {
            return cachedConversation
          }

          return {
            ...cachedConversation,
            client: {
              ...cachedConversation.client,
              name: variables.profileName,
            },
          }
        }
      )

      queryClient.setQueryData<InfiniteData<ChatResponse>>(
        ['chats'],
        (cachedData) => {
          if (!cachedData) return cachedData

          const updatedPages = cachedData.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((conv) =>
              conv.id === chat.id
                ? {
                    ...conv,
                    client: conv.client
                      ? { ...conv.client, name: variables.profileName }
                      : conv.client,
                  }
                : conv
            ),
          }))

          return { ...cachedData, pages: updatedPages }
        }
      )
    },
  })

  const lastMsg = useMemo(() => {
    return chat.lastMessage ? (
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
  }, [chat.lastMessage])

  const PlatformIcon = {
    whatsappweb: WhatsAppBusinessIcon,
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
      setTempName(chat.client?.name || 'Desconocido')
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tempName.trim()) {
      void handleNameChange(tempName)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setTempName(chat.client?.name || 'Desconocido')
    }
    e.stopPropagation()
  }

  const handleBlur = () => {
    void handleNameChange(tempName)
    setShouldHighlight(false)
  }

  const handleMarkAsUnread = () => {
    markAsUnread(chat.id)
    chat.newClientMessagesCount = 1
  }

  const [isAddTagsModalOpen, setIsAddTagsModalOpen] = useState(false)
  const { updateClientTags } = useUpdateClientTags()

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  const handleAddTags = async (tagIds: string[]) => {
    if (chat.client) {
      await updateClientTags(chat.client.id, tagIds)
    }
  }

  const removeConversation = async () => {
    await remove(chat.id)
    void navigate({
      search: () => ({ chatId: undefined }),
      replace: true,
    })
  }

  const clientInitial = useMemo(
    () => chat.client?.name?.[0] || '?',
    [chat.client]
  )

  const hasPhoto = useMemo(
    () => chat.client?.photo && chat.client.photo.length > 0,
    [chat.client]
  )

  const handleOnClick = async () => {
    queryClient.setQueryData<ChatMessages>(['chat', chat.id], (cachedChat) => {
      if (!cachedChat) return cachedChat

      return {
        ...cachedChat,
        newClientMessagesCount:
          cachedChat.id === chat.id ? 0 : cachedChat.newClientMessagesCount,
      }
    })

    queryClient.setQueryData<InfiniteData<ChatResponse>>(
      ['chats'],
      (cachedData) => {
        if (!cachedData) return cachedData

        const updatedPages = cachedData.pages.map((page) => ({
          ...page,
          conversations: page.conversations.map((conv) =>
            conv.id === chat.id ? { ...conv, newClientMessagesCount: 0 } : conv
          ),
        }))

        return { ...cachedData, pages: updatedPages }
      }
    )

    onClick()
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleCheck?.()
  }

  const [isHovering, setIsHovering] = useState(false)

  return (
    <div
      className={cn(
        'flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75 cursor-pointer group',
        isSelected && 'sm:bg-muted'
      )}
      onClick={handleOnClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className='flex gap-2 w-full items-start'>
        <div className='relative flex-shrink-0'>
          {/* Show checkbox on hover or when checked, replace avatar */}
          {onToggleCheck && (isHovering || isChecked) ? (
            <div
              className='flex items-center justify-center w-10 h-10 rounded-full bg-secondary'
              onClick={handleCheckboxClick}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={onToggleCheck}
                aria-label='Seleccionar chat'
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <Avatar>
              {hasPhoto && (
                <AvatarImage
                  src={chat.client?.photo}
                  alt={chat.client?.name || 'Desconocido'}
                  className='object-cover w-full'
                />
              )}
              <AvatarFallback>{clientInitial}</AvatarFallback>
            </Avatar>
          )}
          {PlatformIcon && !((isHovering || isChecked) && onToggleCheck) && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md'>
              <PlatformIcon
                className={cn(
                  'w-3.5 h-3.5',
                  chat.platformName.toLowerCase() === 'whatsappweb' &&
                    'text-green-700',
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
          <span
            className={cn(
              'col-span-4',
              shouldHighlight &&
                !isEditing &&
                'ring-2 ring-blue-500 ring-opacity-75 rounded px-1 animate-pulse'
            )}
            onClick={(e) => {
              if (shouldHighlight && !isEditing) {
                e.stopPropagation()
                setIsEditing(true)
                setShouldHighlight(false)
              }
            }}
          >
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
              chat.client?.name || 'Desconocido'
            )}
          </span>

          <span className='col-span-1 text-xs text-right font-normal text-muted-foreground'>
            {(() => {
              const messageDate = (() => {
                try {
                  if (!chat.lastMessage?.timestamp) {
                    return new Date()
                  }

                  const timestamp = chat.lastMessage.timestamp
                  const date = new Date(timestamp)

                  if (isNaN(date.getTime())) {
                    return new Date()
                  }

                  return date
                } catch (error) {
                  return new Date()
                }
              })()
              const daysDifference = differenceInDays(new Date(), messageDate)

              if (daysDifference > 2) {
                return format(messageDate, 'dd/MM/yy')
              } else if (daysDifference === 1) {
                return 'ayer'
              } else if (daysDifference === 2) {
                return 'anteayer'
              } else {
                return formatDistanceToNowStrict(messageDate, {
                  addSuffix: false,
                  locale: es,
                })
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
              <RenderIfCan permission={PERMISSIONS.CONVERSATION_UPDATE}>
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
                    <RenderIfCan permission={PERMISSIONS.CONVERSATION_DELETE}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsRemoveModalOpen(true)
                        }}
                        className={'text-red-500 hover:text-red-700'}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </RenderIfCan>
                    {chat.client ? (
                      <>
                        <RenderIfCan permission={PERMISSIONS.CLIENT_UPDATE}>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setShouldHighlight(true)
                            }}
                          >
                            Cambiar nombre
                          </DropdownMenuItem>
                        </RenderIfCan>
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
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            const clientData = {
                              id: chat.client?.id,
                              name: chat.client?.name,
                              platformName: chat.platformName,
                              platformId: chat.client?.platformIdentities.find(
                                (i) => i.platformName === chat.platformName
                              )?.platformId,
                              platformIdentities:
                                chat.client?.platformIdentities,
                              conversationId: chat.id,
                            }
                            openConnectionClient(clientData)
                          }}
                        >
                          Vincular
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!chat.client) {
                              return
                            }
                            setCurrentRow({
                              ...chat.client,
                            })
                            setOpen('view')
                          }}
                        >
                          Ver perfil
                        </DropdownMenuItem>
                        {onToggleCheck && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleCheck()
                            }}
                          >
                            {isChecked ? 'Deseleccionar' : 'Seleccionar'}
                          </DropdownMenuItem>
                        )}
                      </>
                    ) : (
                      <DropdownMenuItem disabled>
                        No hay cliente asociado
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </RenderIfCan>
            )}
          </span>
        </div>
      </div>

      <RenderIfCan permission={PERMISSIONS.TAG_CREATE}>
        {chat.client && (
          <AddTagsModal
            open={isAddTagsModalOpen}
            setOpen={setIsAddTagsModalOpen}
            client={chat.client}
            onSave={handleAddTags}
          />
        )}
      </RenderIfCan>

      <RenderIfCan permission={PERMISSIONS.CONVERSATION_DELETE}>
        <RemoveChatConfirmationModal
          open={isRemoveModalOpen}
          setOpen={setIsRemoveModalOpen}
          onConfirm={removeConversation}
          onCancel={() => setIsRemoveModalOpen(false)}
        />
      </RenderIfCan>
    </div>
  )
}

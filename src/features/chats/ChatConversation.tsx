import { Fragment, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import { FileText, Headphones, Image as ImageIcon, Paperclip, Video } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/features/chats/ChatMessage.tsx'
import { Message } from '@/features/chats/ChatTypes'
import { useGetQuickResponses } from '@/features/settings/quickResponse/hooks/useQuickResponses'
import { QuickResponse } from '@/features/settings/quickResponse/types'
import { useMessageGroups } from './hooks/useMessageGroups'

interface ChatConversationProps {
  messages: Message[]
  mobileSelectedChatId: string | null
  autoScrollToBottom?: boolean
}

/**
 * QuickResponseDropdown component to display and filter quick responses.
 * This component is used when typing "/" in the chat input.
 */
interface QuickResponseDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSelectResponse: (message: string, quickResponse?: QuickResponse) => void
  searchTerm: string
  selectedIndex?: number | null
  responses?: QuickResponse[]
  isLoading?: boolean
  anchorRef: React.RefObject<HTMLTextAreaElement | null>
  onSelectionChange?: (index: number | null) => void
}

export function QuickResponseDropdown({
  isOpen,
  onClose,
  onSelectResponse,
  searchTerm,
  selectedIndex = null,
  responses,
  isLoading: isLoadingProp,
  anchorRef,
  onSelectionChange,
}: QuickResponseDropdownProps) {
  // Fallback to fetching data directly if responses are not provided through props
  const { data: quickResponsesData, isLoading: isLoadingData } =
    useGetQuickResponses()

  // Use provided responses or fetch them
  const quickResponses = responses || quickResponsesData
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : isLoadingData

  // Filter quick responses based on the search term (text after "/")
  // Only used if responses are not provided through props
  const filteredResponses =
    !responses && quickResponses
      ? quickResponses.filter(
          (response) =>
            response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            response.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : responses || []

  // Create refs for the selected items
  const selectedItemRef = useRef<HTMLDivElement>(null)

  // Effect to scroll selected item into view when selectedIndex changes
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  const getMediaBadgeIcon = (medias: QuickResponse['medias']) => {
    const types = (medias ?? []).map((m) => (m.type ?? '').toLowerCase())
    if (types.some((t) => t.includes('video'))) return Video
    if (types.some((t) => t.includes('audio'))) return Headphones
    if (types.some((t) => t.includes('document') || t.includes('pdf'))) return FileText
    if (types.some((t) => t.includes('image') || t.includes('imagemessage') || t.includes('sticker'))) {
      return ImageIcon
    }
    return Paperclip
  }

  return (
    <div className='absolute bottom-full left-0 mb-1 w-96 max-h-96 z-50'>
      <div className='bg-popover rounded-md border shadow-md overflow-hidden'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Buscar respuestas rápidas...'
            value={searchTerm}
            readOnly
            className='h-9'
          />
          <CommandList className='max-h-80 overflow-auto'>
            <CommandEmpty>No se encontraron respuestas rápidas.</CommandEmpty>
            {isLoading ? (
              <div className='p-2 text-sm text-muted-foreground'>
                Cargando respuestas rápidas...
              </div>
            ) : (
              <CommandGroup heading='Respuestas rápidas'>
                {filteredResponses.map(
                  (response: QuickResponse, index: number) => {
                    // Determine if this item is the one that should be highlighted
                    const isSelected = selectedIndex === index

                    return (
                      <CommandItem
                        key={response.id}
                        onSelect={() => {
                          // Update the selected index when clicked
                          if (onSelectionChange) {
                            onSelectionChange(index)
                          }
                          onSelectResponse(response.content, response)
                        }}
                        className={cn(
                          'flex flex-col items-start gap-1 py-3',
                          isSelected ? 'bg-accent' : ''
                        )}
                        onMouseEnter={() => {
                          // Update the selected index on hover
                          if (onSelectionChange) {
                            onSelectionChange(index)
                          }
                        }}
                        onClick={() => {
                          // Ensure the index is set on click too (for touch screens)
                          if (onSelectionChange) {
                            onSelectionChange(index)
                          }
                        }}
                        // Remove onMouseLeave to prevent clearing selection when moving to select button
                        // This avoids the flickering effect when moving between items
                        ref={isSelected ? selectedItemRef : null}
                      >
                        <div className='flex items-center justify-between w-full'>
                          <div className='font-medium'>{response.title}</div>
                          {response.medias && response.medias.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {(() => {
                                const Icon = getMediaBadgeIcon(response.medias)
                                return <Icon className="h-3 w-3 mr-1" />
                              })()}
                              {response.medias.length}
                            </Badge>
                          )}
                        </div>
                        <div className='text-sm text-muted-foreground truncate w-full'>
                          {response.content}
                        </div>
                      </CommandItem>
                    )
                  }
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </div>
  )
}

export function ChatConversation({
  messages,
  mobileSelectedChatId,
  autoScrollToBottom = true,
}: ChatConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageGroups = useMessageGroups(messages)

  useEffect(() => {
    if (!mobileSelectedChatId) return
    const scroll = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
    requestAnimationFrame(() => requestAnimationFrame(scroll))
  }, [messages, mobileSelectedChatId])

  useEffect(() => {
    if (!autoScrollToBottom) return
    if (!mobileSelectedChatId) return

    const scroll = () => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }

    requestAnimationFrame(() => requestAnimationFrame(scroll))
  }, [autoScrollToBottom, messages.length, mobileSelectedChatId])

  return (
    <div className='flex size-full flex-1 overflow-hidden'>
      <div className='chat-text-container relative flex flex-1 flex-col w-full'>
        <ScrollArea
          key={mobileSelectedChatId}
          className='chat-flex flex h-full w-full flex-grow flex-col'
        >
          <div className='flex flex-col min-h-full px-1 sm:px-2 md:px-4 pt-4 pb-6'>
            {Object.entries(messageGroups).map(([date, groupMessages]) => {
              return (
                <Fragment key={date}>
                  <div className='relative my-6 flex items-center justify-center'>
                    <Separator className='absolute inset-x-0' />
                    <span className='relative rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm'>
                      {date}
                    </span>
                  </div>
                  <div className='space-y-1.5'>
                    {groupMessages.map((message) => {
                      return (
                        <ChatMessage key={`${message.id}`} message={message} />
                      )
                    })}
                  </div>
                </Fragment>
              )
            })}
            <div ref={messagesEndRef} className='h-4' />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export function ChatConversationSkeleton() {
  return (
    <div className='flex size-full flex-1 overflow-hidden'>
      <div className='chat-text-container relative flex flex-1 flex-col w-full'>
        <ScrollArea className='chat-flex flex h-40 w-full flex-grow flex-col'>
          <div className='flex flex-col min-h-full pt-4 pb-6 space-y-6'>
            {/* Date skeleton */}
            <div className='flex items-center justify-center py-4'>
              <Skeleton className='h-6 w-20 rounded-full' />
            </div>
            
            {Array.from({ length: 4 }).map((_, index) => {
              const roles = ['user', 'assistant', 'business', 'user']
              const role = roles[index]
              const colors = {
                user: 'bg-gray-100',
                assistant: 'bg-[#278EFF]/20', 
                business: 'bg-[#278EFF]/20'
              }
              
              return (
                <div
                  key={index}
                  className={cn(
                    'flex w-full px-4',
                    role === 'user' ? 'justify-start' : 'justify-end'
                  )}
                >
                  <Skeleton
                    className={cn(
                      'h-12 rounded-2xl shadow-sm',
                      role === 'user' 
                        ? 'w-48 rounded-bl-md' 
                        : 'w-56 rounded-br-md',
                      colors[role as keyof typeof colors]
                    )}
                  />
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

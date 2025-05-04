import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { ChatMessage } from '@/features/chats/ChatMessage.tsx'
import { Message } from '@/features/chats/ChatTypes'
import { cn } from '@/lib/utils.ts'
import { Fragment, useEffect, useRef } from 'react'
import { useMessageGroups } from './hooks/useMessageGroups'
import { useGetQuickResponses } from '@/features/settings/quickResponse/hooks/useQuickResponses'
import { QuickResponse } from '@/features/settings/quickResponse/types'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface ChatConversationProps {
  messages?: Message[]
  mobileSelectedChatId: string | null
}

/**
 * QuickResponseDropdown component to display and filter quick responses.
 * This component is used when typing "/" in the chat input.
 */
interface QuickResponseDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSelectResponse: (message: string) => void
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
  onSelectionChange
}: QuickResponseDropdownProps) {
  // Fallback to fetching data directly if responses are not provided through props
  const { data: quickResponsesData, isLoading: isLoadingData } = useGetQuickResponses()
  
  // Use provided responses or fetch them
  const quickResponses = responses || quickResponsesData
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : isLoadingData
  
  // Filter quick responses based on the search term (text after "/")
  // Only used if responses are not provided through props
  const filteredResponses = !responses && quickResponses
    ? quickResponses.filter(response => 
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
        block: 'nearest'
      })
    }
  }, [selectedIndex])
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute bottom-full left-0 mb-1 w-96 max-h-96 z-50">
      <div className="bg-popover rounded-md border shadow-md overflow-hidden">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar respuestas rápidas..." 
            value={searchTerm} 
            readOnly 
            className="h-9"
          />
          <CommandList className="max-h-80 overflow-auto">
            <CommandEmpty>No se encontraron respuestas rápidas.</CommandEmpty>
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">Cargando respuestas rápidas...</div>
            ) : (
              <CommandGroup heading="Respuestas rápidas">
                {filteredResponses.map((response: QuickResponse, index: number) => {
                  // Determine if this item is the one that should be highlighted
                  const isSelected = selectedIndex === index;
                  
                  return (
                    <CommandItem
                      key={response.id}
                      onSelect={() => {
                        // Update the selected index when clicked
                        if (onSelectionChange) {
                          onSelectionChange(index);
                        }
                        onSelectResponse(response.content);
                      }}
                      className={cn(
                        "flex flex-col items-start gap-1 py-3",
                        isSelected ? "bg-accent" : ""
                      )}
                      onMouseEnter={() => {
                        // Update the selected index on hover
                        if (onSelectionChange) {
                          onSelectionChange(index);
                        }
                      }}
                      onClick={() => {
                        // Ensure the index is set on click too (for touch screens)
                        if (onSelectionChange) {
                          onSelectionChange(index);
                        }
                      }}
                      // Remove onMouseLeave to prevent clearing selection when moving to select button
                      // This avoids the flickering effect when moving between items
                      ref={isSelected ? selectedItemRef : null}
                    >
                      <div className="font-medium">{response.title}</div>
                      <div className="text-sm text-muted-foreground truncate w-full">
                        {response.content}
                      </div>
                    </CommandItem>
                  );
                })}
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

  return (
    <div className='flex size-full flex-1'>
      <div className='chat-text-container relative -mr-4 flex flex-1 flex-col'>
        <ScrollArea
          key={mobileSelectedChatId}
          className='chat-flex flex h-40 w-full flex-grow flex-col py-2 pb-4 pr-4'
        >
          <div className='flex flex-col space-y-1'>
          {Object.entries(messageGroups).map(([date, groupMessages]) => {
            return (
              <Fragment key={date}>
                <div className='text-center text-xs flex items-center justify-center'>
                  <span className="bg-muted/50 rounded-full p-2">{date}</span>
                </div>
                {groupMessages.map((message, index) => {
                  return (
                    <div
                      key={`${message.role}-${message.timestamp}-${index}`}
                      className='flex flex-col'
                    >
                      <ChatMessage message={message} />
                    </div>
                  )
                })}
              </Fragment>
            )
          })}
          <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export function ChatConversationSkeleton() {
  return (
    <div className='flex size-full flex-1'>
      <div className='chat-text-container relative -mr-4 flex flex-1 flex-col'>
        <ScrollArea className='chat-flex flex h-40 w-full flex-grow flex-col py-2 pb-4 pr-4'>
          <div className='flex flex-col space-y-6'>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                'h-12 w-48 rounded-lg',
                index % 2 === 0 ? 'self-end' : 'self-start'
              )}
            />
          ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

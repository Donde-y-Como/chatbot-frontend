import { useEffect, useRef } from 'react'
import { useSearch } from '@tanstack/react-router'
import { SearchChatParams } from '@/routes/_authenticated/chats'

/**
 * Hook to handle highlighting and scrolling to a specific message
 * @param messageId The ID of the current message
 * @returns An object with the ref for the message element and whether it should be highlighted
 */
export function useHighlightedMessage(messageId: string) {
  const { highlightMessageId } = useSearch({ 
    from: '/_authenticated/chats/' 
  }) as SearchChatParams
  
  const messageRef = useRef<HTMLDivElement>(null)
  const isHighlighted = highlightMessageId === messageId

  useEffect(() => {
    if (isHighlighted && messageRef.current) {
      // Wait a bit to ensure the DOM is fully rendered
      setTimeout(() => {
        messageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 300)
    }
  }, [isHighlighted, highlightMessageId])

  return {
    messageRef,
    isHighlighted
  }
}

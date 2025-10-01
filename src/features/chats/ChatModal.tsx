import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChatContent } from './ChatContent'
import { ChatMessages } from './ChatTypes'

interface ChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  isError: boolean
  error: any
  chatData?: ChatMessages
  selectedChatId: string
  onBackClick: () => void
}

export function ChatModal({
  open,
  onOpenChange,
  isLoading,
  isError,
  error,
  chatData,
  selectedChatId,
  onBackClick,
}: ChatModalProps) {
  const isMobile = useIsMobile()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl w-[95vw] h-[95vh] flex flex-col p-0 gap-0'>
        <DialogHeader className='px-6 py-4 border-b flex-shrink-0'>
          <DialogTitle className='flex items-center gap-2'>
            <span>Chat: {chatData?.client.name || 'Cargando...'}</span>
          </DialogTitle>
        </DialogHeader>
        <div className='flex-1 min-h-0 overflow-hidden'>
          <div className='h-full flex flex-col'>
            <ChatContent
              isLoading={isLoading}
              isError={isError}
              error={error}
              chatData={chatData}
              selectedChatId={selectedChatId}
              mobileSelectedChatId={selectedChatId}
              isMobileVisible={true}
              onBackClick={onBackClick}
              isModal={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
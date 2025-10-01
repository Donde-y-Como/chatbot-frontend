import React from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

export type ChatViewMode = 'list' | 'kanban'

interface ChatViewToggleProps {
  currentView: ChatViewMode
  onViewChange: (view: ChatViewMode) => void
}

export function ChatViewToggle({ currentView, onViewChange }: ChatViewToggleProps) {
  return (
    <TooltipProvider>
      <div className='flex items-center rounded-md border bg-background p-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              size='sm'
              className={cn(
                'h-7 px-2 py-1',
                currentView === 'list'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted'
              )}
              onClick={() => onViewChange('list')}
            >
              <List className='h-4 w-4' />
              <span className='ml-1 text-xs hidden sm:inline'>Lista</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            <p>Vista de lista</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === 'kanban' ? 'default' : 'ghost'}
              size='sm'
              className={cn(
                'h-7 px-2 py-1',
                currentView === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted'
              )}
              onClick={() => onViewChange('kanban')}
            >
              <LayoutGrid className='h-4 w-4' />
              <span className='ml-1 text-xs hidden sm:inline'>Kanban</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            <p>Vista kanban</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
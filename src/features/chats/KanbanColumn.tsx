import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ChatStatus } from './ChatTypes'

interface KanbanColumnProps {
  id: ChatStatus
  title: string
  subtitle: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({
  id,
  title,
  subtitle,
  count,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const getStatusColor = (status: ChatStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
      case 'in_progress':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
      case 'done':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300'
    }
  }

  const getDropOverColor = (status: ChatStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 border-blue-300 dark:bg-blue-900/10'
      case 'in_progress':
        return 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/10'
      case 'done':
        return 'bg-green-50 border-green-300 dark:bg-green-900/10'
      default:
        return 'bg-gray-50 border-gray-300 dark:bg-gray-900/10'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] w-full h-full',
        'rounded-lg border-2 border-dashed transition-all duration-200',
        isOver ? getDropOverColor(id) : 'border-border bg-background'
      )}
    >
      {/* Column Header */}
      <div className='flex-shrink-0 p-4 border-b'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
          <Badge variant='secondary' className={cn(getStatusColor(id))}>
            {count}
          </Badge>
        </div>
        <p className='text-sm text-muted-foreground'>{subtitle}</p>
      </div>

      {/* Column Content */}
      <div className='flex-1 flex flex-col min-h-0 p-2'>
        {children}
      </div>

      {/* Empty State */}
      {count === 0 && (
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='text-center text-muted-foreground'>
            <div className='text-4xl opacity-20 mb-2'>📝</div>
            <p className='text-sm'>Sin conversaciones</p>
          </div>
        </div>
      )}
    </div>
  )
}
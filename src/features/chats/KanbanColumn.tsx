import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ConversationStatus } from './conversationStatus/types'
import { ColumnSettingsMenu } from './conversationStatus/components/column-settings-menu'

interface KanbanColumnProps {
  id: string
  title: string
  subtitle: string
  count: number
  color?: string
  status?: ConversationStatus
  onEditColumn?: () => void
  onDeleteColumn?: () => void
  children: React.ReactNode
}

export function KanbanColumn({
  id,
  title,
  subtitle,
  count,
  color,
  status,
  onEditColumn,
  onDeleteColumn,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Helper to convert hex color to RGB values
  const hexToRgb = (hex?: string) => {
    if (!hex) return null
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  // Generate dynamic color classes based on hex color
  const getStatusColorStyles = () => {
    if (!color) {
      return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300'
    }

    const rgb = hexToRgb(color)
    if (!rgb) {
      return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300'
    }

    return ''
  }

  const getDropOverStyles = () => {
    if (!color) return 'bg-gray-50 border-gray-300 dark:bg-gray-900/10'
    const rgb = hexToRgb(color)
    if (!rgb) return 'bg-gray-50 border-gray-300 dark:bg-gray-900/10'
    return ''
  }

  const badgeStyle = color
    ? {
        backgroundColor: `${color}20`,
        borderColor: color,
        color: color,
      }
    : undefined

  const dropOverStyle = color
    ? {
        backgroundColor: `${color}10`,
        borderColor: color,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] w-full h-full',
        'rounded-lg border-2 border-dashed transition-all duration-200',
        isOver && !color ? getDropOverStyles() : '',
        !isOver && 'border-border bg-background'
      )}
      style={isOver && color ? dropOverStyle : undefined}
    >
      {/* Column Header */}
      <div className='flex-shrink-0 p-4 border-b'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2 flex-1'>
            <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
            <Badge
              variant='secondary'
              className={cn(!color && getStatusColorStyles())}
              style={badgeStyle}
            >
              {count}
            </Badge>
          </div>
          {status && onEditColumn && onDeleteColumn && (
            <ColumnSettingsMenu
              status={status}
              onEdit={onEditColumn}
              onDelete={onDeleteColumn}
            />
          )}
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
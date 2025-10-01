import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Chat, ChatStatus } from './ChatTypes'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'

interface ChatKanbanProps {
  chats: Chat[]
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
  onChatStatusChange: (chatId: string, newStatus: ChatStatus) => void
  onChatClick: (chatId: string, messageId?: string) => void
  filteredChatList: Chat[]
}

export function ChatKanban({
  chats,
  selectedChatId,
  onChatSelect,
  onChatStatusChange,
  onChatClick,
  filteredChatList,
}: ChatKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedChat, setDraggedChat] = useState<Chat | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns: { id: ChatStatus; title: string; subtitle: string }[] = [
    {
      id: 'new',
      title: 'Nuevos',
      subtitle: 'Conversaciones recién iniciadas',
    },
    {
      id: 'in_progress',
      title: 'En Progreso',
      subtitle: 'Conversaciones activas',
    },
    {
      id: 'done',
      title: 'Terminadas',
      subtitle: 'Conversaciones finalizadas',
    },
  ]

  const chatsByStatus = useMemo(() => {
    const grouped = filteredChatList.reduce(
      (acc, chat) => {
        const status = chat.status || 'new' // Default to 'new' if no status
        if (!acc[status]) {
          acc[status] = []
        }
        acc[status].push(chat)
        return acc
      },
      {} as Record<ChatStatus, Chat[]>
    )

    // Ensure all statuses have arrays
    columns.forEach((column) => {
      if (!grouped[column.id]) {
        grouped[column.id] = []
      }
    })

    return grouped
  }, [filteredChatList, columns])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    const chat = filteredChatList.find((c) => c.id === active.id)
    setDraggedChat(chat || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setDraggedChat(null)
      return
    }

    const chatId = active.id as string
    const newStatus = over.id as ChatStatus

    // Check if we're dropping over a column
    if (columns.some((col) => col.id === newStatus)) {
      onChatStatusChange(chatId, newStatus)
    }

    setActiveId(null)
    setDraggedChat(null)
  }

  const handleChatClick = (chatId: string, messageId?: string) => {
    onChatSelect(chatId)
    onChatClick(chatId, messageId)
  }

  return (
    <div className='flex h-full w-full overflow-hidden'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className='flex gap-4 p-4 h-full w-full overflow-x-auto overflow-y-hidden'>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              subtitle={column.subtitle}
              count={chatsByStatus[column.id]?.length || 0}
            >
              <ScrollArea className='flex-1 pr-2'>
                <SortableContext
                  items={chatsByStatus[column.id]?.map((chat) => chat.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className='space-y-2 pb-2'>
                    {chatsByStatus[column.id]?.map((chat) => (
                      <KanbanCard
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        isDragging={activeId === chat.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </ScrollArea>
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeId && draggedChat ? (
            <div className='rotate-3 opacity-80'>
              <KanbanCard
                chat={draggedChat}
                isSelected={false}
                onClick={() => {}}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
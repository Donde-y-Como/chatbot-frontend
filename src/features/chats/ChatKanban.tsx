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
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Chat } from './ChatTypes'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'
import {
  useGetConversationStatuses,
  useCreateConversationStatus,
  useUpdateConversationStatus,
  useDeleteConversationStatus,
} from './conversationStatus/hooks/useConversationStatus'
import {
  ConversationStatus,
  ConversationStatusFormValues,
} from './conversationStatus/types'
import { ConversationStatusDialog } from './conversationStatus/components/conversation-status-dialog'
import { DeleteConversationStatusDialog } from './conversationStatus/components/delete-conversation-status-dialog'
import { RenderIfCan } from '@/lib/Can'
import { PERMISSIONS } from '@/api/permissions'

interface ChatKanbanProps {
  chats: Chat[]
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
  onChatStatusChange: (chatId: string, newStatus: string) => void
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

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ConversationStatus | undefined>(
    undefined
  )

  // Fetch conversation statuses
  const { data: conversationStatuses = [], isLoading } = useGetConversationStatuses()

  // Mutations
  const { mutateAsync: createStatus, isPending: isCreating } =
    useCreateConversationStatus()
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateConversationStatus()
  const { mutateAsync: deleteStatus, isPending: isDeleting } =
    useDeleteConversationStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Sort statuses by orderNumber
  const columns = useMemo(() => {
    return [...conversationStatuses].sort((a, b) => a.orderNumber - b.orderNumber)
  }, [conversationStatuses])

  const chatsByStatus = useMemo(() => {
    const grouped = filteredChatList.reduce(
      (acc, chat) => {
        const status = chat.status || (columns[0]?.id || 'new') // Default to first status or 'new'
        if (!acc[status]) {
          acc[status] = []
        }
        acc[status].push(chat)
        return acc
      },
      {} as Record<string, Chat[]>
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
    const newStatus = over.id as string

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

  // Column CRUD handlers
  const handleCreateColumn = async (values: ConversationStatusFormValues) => {
    await createStatus(values)
    setIsCreateDialogOpen(false)
  }

  const handleEditColumn = (status: ConversationStatus) => {
    setSelectedStatus(status)
    setIsEditDialogOpen(true)
  }

  const handleUpdateColumn = async (values: ConversationStatusFormValues) => {
    if (selectedStatus) {
      const updateData: {
        name?: string
        orderNumber?: number
        color?: string
      } = {}

      if (values.name !== selectedStatus.name) {
        updateData.name = values.name
      }
      if (values.orderNumber !== selectedStatus.orderNumber) {
        updateData.orderNumber = values.orderNumber
      }
      if (values.color !== selectedStatus.color) {
        updateData.color = values.color
      }

      if (Object.keys(updateData).length > 0) {
        await updateStatus({
          id: selectedStatus.id,
          data: updateData,
        })
      }

      setIsEditDialogOpen(false)
      setSelectedStatus(undefined)
    }
  }

  const handleDeleteColumn = (status: ConversationStatus) => {
    setSelectedStatus(status)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedStatus) {
      await deleteStatus(selectedStatus.id)
      setIsDeleteDialogOpen(false)
      setSelectedStatus(undefined)
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-muted-foreground'>Cargando estados...</div>
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-center text-muted-foreground'>
          <p className='text-lg font-semibold mb-2'>
            No hay estados de conversación configurados
          </p>
          <p className='text-sm'>
            Crea estados para organizar tus conversaciones
          </p>
        </div>
      </div>
    )
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
              title={column.name}
              subtitle={`Orden ${column.orderNumber}`}
              count={chatsByStatus[column.id]?.length || 0}
              color={column.color}
              status={column}
              onEditColumn={() => handleEditColumn(column)}
              onDeleteColumn={() => handleDeleteColumn(column)}
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

          {/* Add new column button */}
          <RenderIfCan permission={PERMISSIONS.CONVERSATION_STATUS_CREATE}>
            <div className='flex-shrink-0 min-w-[280px]'>
              <Button
                variant='outline'
                className='w-full h-full min-h-[200px] border-dashed border-2 hover:bg-accent'
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <div className='flex flex-col items-center gap-2'>
                  <Plus className='h-8 w-8' />
                  <span className='text-sm font-medium'>Nueva columna</span>
                </div>
              </Button>
            </div>
          </RenderIfCan>
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

      {/* Create Column Dialog */}
      <ConversationStatusDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateColumn}
        isSubmitting={isCreating}
        title='Crear columna'
        submitLabel='Crear'
        mode='create'
      />

      {/* Edit Column Dialog */}
      <ConversationStatusDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedStatus(undefined)
        }}
        onSubmit={handleUpdateColumn}
        isSubmitting={isUpdating}
        initialData={selectedStatus}
        title='Editar columna'
        submitLabel='Actualizar'
        mode='edit'
      />

      {/* Delete Column Dialog */}
      <DeleteConversationStatusDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedStatus(undefined)
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        status={selectedStatus}
      />
    </div>
  )
}
import { useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { Loader2, Plus, Search } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ContentSection from '@/features/settings/components/content-section'
import { DeleteConversationStatusDialog } from './components/delete-conversation-status-dialog'
import { ConversationStatusDialog } from './components/conversation-status-dialog'
import { ConversationStatusList } from './components/conversation-status-list'
import { ViewConversationStatusDialog } from './components/view-conversation-status-dialog'
import {
  useCreateConversationStatus,
  useDeleteConversationStatus,
  useGetConversationStatuses,
  useUpdateConversationStatus,
} from './hooks/useConversationStatus'
import { ConversationStatus, ConversationStatusFormValues } from './types'
import { RenderIfCan } from '@/lib/Can'

export default function ConversationStatusSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ConversationStatus | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce search
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const {
    data: statuses,
    isPending: isLoadingStatuses,
    error: statusesError,
  } = useGetConversationStatuses()

  const { mutateAsync: createStatus, isPending: isCreating } =
    useCreateConversationStatus()
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateConversationStatus()
  const { mutateAsync: deleteStatus, isPending: isDeleting } =
    useDeleteConversationStatus()

  // Filter statuses based on search
  const filteredStatuses = useMemo(() => {
    if (!statuses) return []

    if (!debouncedSearchQuery.trim()) {
      return statuses
    }

    const query = debouncedSearchQuery.toLowerCase().trim()

    return statuses.filter((status) => status.name.toLowerCase().includes(query))
  }, [statuses, debouncedSearchQuery])

  const handleCreate = async (values: ConversationStatusFormValues) => {
    await createStatus(values)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (values: ConversationStatusFormValues) => {
    if (selectedStatus) {
      // Only send changed fields
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

  const handleDelete = async () => {
    if (selectedStatus) {
      await deleteStatus(selectedStatus.id)
      setIsDeleteDialogOpen(false)
      setSelectedStatus(undefined)
    }
  }

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (status: ConversationStatus) => {
    setSelectedStatus(status)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (status: ConversationStatus) => {
    setSelectedStatus(status)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (status: ConversationStatus) => {
    setSelectedStatus(status)
    setIsViewDialogOpen(true)
  }

  return (
    <ContentSection
      title='Estados de Conversación'
      desc='Administra los estados para organizar tus conversaciones en el kanban'
    >
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <h3 className='text-lg font-medium'>Tus estados</h3>

          <RenderIfCan permission={PERMISSIONS.CONVERSATION_STATUS_CREATE}>
            <Button onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo estado
            </Button>
          </RenderIfCan>
        </div>

        {/* Search bar */}
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Buscar por nombre'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Search info */}
        {debouncedSearchQuery && (
          <div className='text-sm text-muted-foreground'>
            {filteredStatuses.length === 0
              ? `No se encontraron estados que coincidan con "${debouncedSearchQuery}"`
              : `Mostrando ${filteredStatuses.length} de ${statuses?.length || 0} estados`}
          </div>
        )}

        {isLoadingStatuses && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando estados...</span>
          </div>
        )}

        {statusesError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar los estados</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los estados de conversación. Por favor, intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {statuses && (
          <ConversationStatusList
            statuses={filteredStatuses}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
          />
        )}

        {/* View Dialog */}
        {selectedStatus && (
          <ViewConversationStatusDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedStatus(undefined)
            }}
            data={selectedStatus}
          />
        )}

        {/* Create Dialog */}
        <ConversationStatusDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          title='Crear estado de conversación'
          submitLabel='Crear'
          mode='create'
        />

        {/* Edit Dialog */}
        <ConversationStatusDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedStatus(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedStatus}
          title='Editar estado de conversación'
          submitLabel='Actualizar'
          mode='edit'
        />

        {/* Delete Dialog */}
        <DeleteConversationStatusDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedStatus(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          status={selectedStatus}
        />
      </div>
    </ContentSection>
  )
}

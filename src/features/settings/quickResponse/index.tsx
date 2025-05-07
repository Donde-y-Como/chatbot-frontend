import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ViewQuickResponseDialog } from '@/features/settings/quickResponse/components/view-quick-response-dialog.tsx'
import ContentSection from '../components/content-section'
import { DeleteQuickResponseDialog } from './components/delete-quick-response-dialog'
import { QuickResponseDialog } from './components/quick-response-dialog'
import { QuickResponseList } from './components/quick-response-list'
import {
  useGetQuickResponses,
  useCreateQuickResponse,
  useUpdateQuickResponse,
  useDeleteQuickResponse,
} from './hooks/useQuickResponses'
import { QuickResponse, QuickResponseFormValues } from './types'

export default function QuickResponsesSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuickResponse, setSelectedQuickResponse] = useState<
    QuickResponse | undefined
  >(undefined)

  const {
    data: quickResponses,
    isPending: isLoadingQuickResponses,
    error: quickResponsesError,
  } = useGetQuickResponses()

  const { mutateAsync: createQuickResponse, isPending: isCreating } =
    useCreateQuickResponse()
  const { mutateAsync: updateQuickResponse, isPending: isUpdating } =
    useUpdateQuickResponse()
  const { mutateAsync: deleteQuickResponse, isPending: isDeleting } =
    useDeleteQuickResponse()

  const handleCreate = async (values: QuickResponseFormValues) => {

    await createQuickResponse(values)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (values: QuickResponseFormValues) => {
    if (selectedQuickResponse) {
      await updateQuickResponse({
        id: selectedQuickResponse.id,
        data: values,
      })
      setIsEditDialogOpen(false)
      setSelectedQuickResponse(undefined)
    }
  }

  const handleDelete = async () => {
    if (selectedQuickResponse) {
      await deleteQuickResponse(selectedQuickResponse.id)
      setIsDeleteDialogOpen(false)
      setSelectedQuickResponse(undefined)
    }
  }

  const openEditDialog = (quickResponse: QuickResponse) => {
    setSelectedQuickResponse(quickResponse)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (quickResponse: QuickResponse) => {
    setSelectedQuickResponse(quickResponse)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (quickResponse: QuickResponse) => {
    setSelectedQuickResponse(quickResponse)
    setIsViewDialogOpen(true)
  }

  return (
    <ContentSection
      title='Respuestas Rápidas'
      desc='Administra tus respuestas rápidas para agilizar la comunicación con tus clientes'
    >
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium'>Tus respuestas rápidas</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Agregar respuesta
          </Button>
        </div>

        {isLoadingQuickResponses && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando respuestas rápidas...</span>
          </div>
        )}

        {quickResponsesError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar las respuestas rápidas</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las respuestas rápidas. Por favor, intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {quickResponses && (
          <QuickResponseList
            quickResponses={quickResponses}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
          />
        )}

        {selectedQuickResponse && (
          <ViewQuickResponseDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            data={selectedQuickResponse}
          />
        )}

        {/* Create Dialog */}
        <QuickResponseDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          title='Crear respuesta rápida'
          submitLabel='Crear'
        />

        {/* Edit Dialog */}
        <QuickResponseDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedQuickResponse(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedQuickResponse}
          title='Editar respuesta rápida'
          submitLabel='Actualizar'
        />

        {/* Delete Dialog */}
        <DeleteQuickResponseDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedQuickResponse(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          quickResponse={selectedQuickResponse}
        />
      </div>
    </ContentSection>
  )
}

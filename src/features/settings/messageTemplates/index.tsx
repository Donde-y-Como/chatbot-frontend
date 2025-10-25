import { useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { Loader2, Plus, Search, MessageSquare } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ContentSection from '../components/content-section'
import { DeleteMessageTemplateDialog } from './components/delete-message-template-dialog'
import { MessageTemplateDialog } from './components/message-template-dialog'
import { MessageTemplateList } from './components/message-template-list'
import { ViewMessageTemplateDialog } from './components/view-message-template-dialog'
import {
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useGetMessageTemplates,
  useUpdateMessageTemplate,
} from './hooks/useMessageTemplates'
import {
  MessageTemplateFormValues,
  MessageTemplate,
  MessageTemplateDialogMode,
  templateTypeLabels,
  MessageTemplateType,
} from './types'
import { RenderIfCan } from '@/lib/Can.tsx'

export default function MessageTemplatesSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<MessageTemplateDialogMode>('create')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const {
    data: templates,
    isPending: isLoadingTemplates,
    error: templatesError,
  } = useGetMessageTemplates()

  const { mutateAsync: createTemplate, isPending: isCreating } = useCreateMessageTemplate()
  const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateMessageTemplate()
  const { mutateAsync: deleteTemplate, isPending: isDeleting } = useDeleteMessageTemplate()

  const filteredTemplates = useMemo(() => {
    if (!templates) return []

    let result = templates

    if (filterType !== 'all') {
      result = result.filter((template) => template.type === filterType)
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      result = result.filter(
        (template) =>
          templateTypeLabels[template.type].toLowerCase().includes(query) ||
          template.template.toLowerCase().includes(query)
      )
    }

    return result
  }, [templates, debouncedSearchQuery, filterType])

  const handleCreate = async (values: MessageTemplateFormValues) => {
    await createTemplate(values)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (values: MessageTemplateFormValues) => {
    if (selectedTemplate) {
      const updateData: { template?: string; isActive?: boolean } = {}

      if (values.template !== selectedTemplate.template) {
        updateData.template = values.template
      }
      if (values.isActive !== selectedTemplate.isActive) {
        updateData.isActive = values.isActive
      }

      if (Object.keys(updateData).length > 0) {
        await updateTemplate({
          id: selectedTemplate.id,
          data: updateData,
        })
      }

      setIsEditDialogOpen(false)
      setSelectedTemplate(undefined)
    }
  }

  const handleDelete = async () => {
    if (selectedTemplate) {
      await deleteTemplate(selectedTemplate.id)
      setIsDeleteDialogOpen(false)
      setSelectedTemplate(undefined)
    }
  }

  const openCreateDialog = () => {
    setDialogMode('create')
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setDialogMode('edit')
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setIsViewDialogOpen(true)
  }

  return (
    <ContentSection
      title='Plantillas de Mensajes'
      desc='Personaliza los mensajes automáticos que se envían a tus clientes'
    >
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5 text-primary' />
            <h3 className='text-lg font-medium'>Tus plantillas</h3>
          </div>

          <RenderIfCan permission={PERMISSIONS.BUSINESS_UPDATE}>
            <Button onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              Nueva plantilla
            </Button>
          </RenderIfCan>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Buscar plantillas...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className='w-full sm:w-[250px]'>
              <SelectValue placeholder='Filtrar por tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los tipos</SelectItem>
              {Object.entries(templateTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(debouncedSearchQuery || filterType !== 'all') && (
          <div className='text-sm text-muted-foreground'>
            {filteredTemplates.length === 0
              ? 'No se encontraron plantillas que coincidan con los filtros'
              : `Mostrando ${filteredTemplates.length} de ${templates?.length || 0} plantillas`}
          </div>
        )}

        {isLoadingTemplates && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando plantillas...</span>
          </div>
        )}

        {templatesError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar las plantillas</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las plantillas. Por favor, intenta recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {templates && (
          <MessageTemplateList
            templates={filteredTemplates}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
          />
        )}

        {selectedTemplate && (
          <ViewMessageTemplateDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedTemplate(undefined)
            }}
            data={selectedTemplate}
          />
        )}

        <MessageTemplateDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          title='Crear plantilla de mensaje'
          submitLabel='Crear'
          mode='create'
        />

        <MessageTemplateDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedTemplate(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedTemplate}
          title='Editar plantilla de mensaje'
          submitLabel='Actualizar'
          mode='edit'
        />

        <DeleteMessageTemplateDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedTemplate(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          template={selectedTemplate}
        />
      </div>
    </ContentSection>
  )
}

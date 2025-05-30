import { useState, useMemo } from 'react'
import { Loader2, Plus, Search, Tag as TagIcon, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@uidotdev/usehooks'
import ContentSection from '../components/content-section'
import { TagList } from './components/tag-list'
import { TagDialog } from './components/tag-dialog'
import { ViewTagDialog } from './components/view-tag-dialog'
import { DeleteTagDialog } from './components/delete-tag-dialog'
import {
  useGetTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from './hooks/useTags'
import { Tag, TagFormValues, SimpleTagFormValues, TagDialogMode } from './types'

export default function TagsSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<TagDialogMode>('create-simple')
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce de la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const {
    data: tags,
    isPending: isLoadingTags,
    error: tagsError,
  } = useGetTags()

  const { mutateAsync: createTag, isPending: isCreating } = useCreateTag()
  const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag()
  const { mutateAsync: deleteTag, isPending: isDeleting } = useDeleteTag()

  // Filtrar etiquetas basándose en la búsqueda
  const filteredTags = useMemo(() => {
    if (!tags) return []
    
    if (!debouncedSearchQuery.trim()) {
      return tags
    }

    const query = debouncedSearchQuery.toLowerCase().trim()
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(query) ||
      tag.description.toLowerCase().includes(query)
    )
  }, [tags, debouncedSearchQuery])

  const handleCreate = async (values: TagFormValues | SimpleTagFormValues) => {
    await createTag(values)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (values: TagFormValues | SimpleTagFormValues) => {
    if (selectedTag) {
      // Solo enviar los campos que han cambiado
      const updateData: { name?: string; color?: string; description?: string } = {}
      
      if ('name' in values && values.name !== selectedTag.name) {
        updateData.name = values.name
      }      
      if ('description' in values && values.description !== selectedTag.description) {
        updateData.description = values.description
      }

      if (Object.keys(updateData).length > 0) {
        await updateTag({
          id: selectedTag.id,
          data: updateData,
        })
      }
      
      setIsEditDialogOpen(false)
      setSelectedTag(undefined)
    }
  }

  const handleDelete = async () => {
    if (selectedTag) {
      await deleteTag(selectedTag.id)
      setIsDeleteDialogOpen(false)
      setSelectedTag(undefined)
    }
  }

  const openCreateCompleteDialog = () => {
    setDialogMode('create-complete')
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setDialogMode('edit')
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setIsViewDialogOpen(true)
  }

  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'create-simple':
        return 'Crear etiqueta rápida'
      case 'create-complete':
        return 'Crear etiqueta completa'
      case 'edit':
        return 'Editar etiqueta'
      default:
        return 'Etiqueta'
    }
  }

  const getSubmitLabel = () => {
    switch (dialogMode) {
      case 'create-simple':
      case 'create-complete':
        return 'Crear'
      case 'edit':
        return 'Actualizar'
      default:
        return 'Guardar'
    }
  }

  return (
    <ContentSection
      title='Etiquetas de Productos'
      desc='Administra las etiquetas para categorizar y destacar tus productos'
    >
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <h3 className='text-lg font-medium'>Tus etiquetas</h3>
                
          <Button onClick={openCreateCompleteDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva etiqueta
          </Button>

        </div>

        {/* Barra de búsqueda */}
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Buscar por nombre, descripción o color...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Mostrar información de búsqueda */}
        {debouncedSearchQuery && (
          <div className='text-sm text-muted-foreground'>
            {filteredTags.length === 0 
              ? `No se encontraron etiquetas que coincidan con "${debouncedSearchQuery}"`
              : `Mostrando ${filteredTags.length} de ${tags?.length || 0} etiquetas`
            }
          </div>
        )}

        {isLoadingTags && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando etiquetas...</span>
          </div>
        )}

        {tagsError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar las etiquetas</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las etiquetas. Por favor, intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {tags && (
          <TagList
            tags={filteredTags}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
          />
        )}

        {/* View Dialog */}
        {selectedTag && (
          <ViewTagDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedTag(undefined)
            }}
            data={selectedTag}
          />
        )}

        {/* Create Dialog */}
        <TagDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          title={getDialogTitle()}
          submitLabel={getSubmitLabel()}
          mode={dialogMode}
        />

        {/* Edit Dialog */}
        <TagDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedTag(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedTag}
          title={getDialogTitle()}
          submitLabel={getSubmitLabel()}
          mode={dialogMode}
        />

        {/* Delete Dialog */}
        <DeleteTagDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedTag(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          tag={selectedTag}
        />
      </div>
    </ContentSection>
  )
}

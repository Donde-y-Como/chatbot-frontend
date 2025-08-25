import { useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { Loader2, Plus, Search } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ContentSection from '../components/content-section'
import { DeleteUnitDialog } from './components/delete-unit-dialog'
import { UnitDialog } from './components/unit-dialog'
import { UnitList } from './components/unit-list'
import { ViewUnitDialog } from './components/view-unit-dialog'
import {
  useCreateUnit,
  useDeleteUnit,
  useGetUnits,
  useUpdateUnit,
} from './hooks/useUnits'
import { Unit, UnitFormValues } from './types'

export default function UnitsSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce de la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const {
    data: units,
    isPending: isLoadingUnits,
    error: unitsError,
  } = useGetUnits()

  const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnit()
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit()
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnit()

  // Filtrar unidades basándome en la búsqueda
  const filteredUnits = useMemo(() => {
    if (!units) return []

    if (!debouncedSearchQuery.trim()) {
      return units
    }

    const query = debouncedSearchQuery.toLowerCase().trim()

    return units.filter(
      (unit) =>
        unit.name.toLowerCase().includes(query) ||
        unit.abbreviation.toLowerCase().includes(query)
    )
  }, [units, debouncedSearchQuery])

  const handleCreate = async (values: UnitFormValues) => {
    await createUnit(values)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (values: UnitFormValues) => {
    if (selectedUnit) {
      // Solo enviar los campos que han cambiado
      const updateData: { name?: string; abbreviation?: string } = {}

      if (values.name !== selectedUnit.name) {
        updateData.name = values.name
      }

      if (values.abbreviation !== selectedUnit.abbreviation) {
        updateData.abbreviation = values.abbreviation
      }

      if (Object.keys(updateData).length > 0) {
        await updateUnit({
          id: selectedUnit.id,
          data: updateData,
        })
      }

      setIsEditDialogOpen(false)
      setSelectedUnit(undefined)
    }
  }

  const handleDelete = async () => {
    if (selectedUnit) {
      await deleteUnit(selectedUnit.id)
      setIsDeleteDialogOpen(false)
      setSelectedUnit(undefined)
    }
  }

  const openEditDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsViewDialogOpen(true)
  }

  return (
    <ContentSection
      title='Unidades de Medida'
      desc='Administra las unidades de medida utilizadas en tus productos'
    >
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <h3 className='text-lg font-medium'>Tus unidades de medida</h3>
          <RenderIfCan permission={PERMISSIONS.UNIT_CREATE}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Agregar unidad
            </Button>
          </RenderIfCan>
        </div>

        {/* Barra de búsqueda */}
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Buscar por nombre o abreviación...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Mostrar información de búsqueda */}
        {debouncedSearchQuery && (
          <div className='text-sm text-muted-foreground'>
            {filteredUnits.length === 0
              ? `No se encontraron unidades que coincidan con "${debouncedSearchQuery}"`
              : `Mostrando ${filteredUnits.length} de ${units?.length || 0} unidades`}
          </div>
        )}

        {isLoadingUnits && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando unidades...</span>
          </div>
        )}

        {unitsError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar las unidades</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las unidades de medida. Por favor, intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {units && (
          <UnitList
            units={filteredUnits}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
          />
        )}

        {/* View Dialog */}
        {selectedUnit && (
          <ViewUnitDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedUnit(undefined)
            }}
            data={selectedUnit}
          />
        )}

        {/* Create Dialog */}
        <UnitDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          title='Crear unidad'
          submitLabel='Crear'
        />

        {/* Edit Dialog */}
        <UnitDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedUnit(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedUnit}
          title='Editar unidad'
          submitLabel='Actualizar'
        />

        {/* Delete Dialog */}
        <DeleteUnitDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedUnit(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          unit={selectedUnit}
        />
      </div>
    </ContentSection>
  )
}

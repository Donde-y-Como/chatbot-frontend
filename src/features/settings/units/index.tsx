import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import ContentSection from '../components/content-section'
import { UnitList } from './components/unit-list'
import { UnitDialog } from './components/unit-dialog'
import { ViewUnitDialog } from './components/view-unit-dialog'
import { DeleteUnitDialog } from './components/delete-unit-dialog'
import {
  useGetUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from './hooks/useUnits'
import { Unit, UnitFormValues } from './types'

export default function UnitsSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>(undefined)

  const {
    data: units,
    isPending: isLoadingUnits,
    error: unitsError,
  } = useGetUnits()

  const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnit()
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit()
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnit()

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
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium'>Tus unidades de medida</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Agregar unidad
          </Button>
        </div>

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
            units={units}
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

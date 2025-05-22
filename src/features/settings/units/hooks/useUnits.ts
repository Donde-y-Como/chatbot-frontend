import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createUnit, deleteUnit, getUnits, updateUnit } from '../unitsService'
import { Unit, UnitFormValues, UpdateUnitValues } from '../types'

export const useGetUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
    meta: {
      errorMessage: 'Error al cargar las unidades',
    },
  })
}

export const useCreateUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUnit,
    onSuccess: (newUnit) => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('¡Unidad creada!', {
        description: `La unidad "${newUnit.name}" (${newUnit.abbreviation}) se creó correctamente.`
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear la unidad', {
        description: error.message
      })
    },
  })
}

export const useUpdateUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUnitValues }) =>
      updateUnit(id, data),
    onSuccess: (updatedUnit) => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('¡Unidad actualizada!', {
        description: `La unidad se actualizó correctamente.`
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la unidad', {
        description: error.message
      })
    },
  })
}

export const useDeleteUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unidad eliminada', {
        description: 'La unidad se eliminó correctamente.'
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la unidad', {
        description: error.message
      })
    },
  })
}

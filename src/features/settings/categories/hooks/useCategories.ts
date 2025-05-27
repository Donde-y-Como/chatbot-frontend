import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  createCategory, 
  deleteCategory, 
  getCategories, 
  getCategoryById,
  updateCategory 
} from '../categoriesService'
import { Category, CategoryFormValues, UpdateCategoryValues } from '../types'

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    meta: {
      errorMessage: 'Error al cargar las categorías',
    },
  })
}

export const useGetCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      const categoryType = newCategory.parentCategoryId ? 'Subcategoría' : 'Categoría'
      toast.success(`¡${categoryType} creada!`, {
        description: `${categoryType} "${newCategory.name}" se creó correctamente.`
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear la categoría', {
        description: error.message
      })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryValues }) =>
      updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      const categoryType = updatedCategory.parentCategoryId ? 'Subcategoría' : 'Categoría'
      toast.success(`¡${categoryType} actualizada!`, {
        description: `${categoryType} "${updatedCategory.name}" se actualizó correctamente.`
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la categoría', {
        description: error.message
      })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoría eliminada', {
        description: 'La categoría se eliminó correctamente.'
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la categoría', {
        description: error.message
      })
    },
  })
}

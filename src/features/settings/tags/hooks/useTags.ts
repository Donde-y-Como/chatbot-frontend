import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  createTag, 
  deleteTag, 
  getTags, 
  getTagById,
  updateTag 
} from '../tagsService'
import { Tag, TagFormValues, SimpleTagFormValues, UpdateTagValues } from '../types'

export const useGetTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    meta: {
      errorMessage: 'Error al cargar las etiquetas',
    },
  })
}

export const useGetTag = (id: string) => {
  return useQuery({
    queryKey: ['tags', id],
    queryFn: () => getTagById(id),
    enabled: !!id,
  })
}

export const useCreateTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('¡Etiqueta creada!', {
        description: `La etiqueta "${newTag.name}" se creó correctamente.`
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear la etiqueta', {
        description: error.message
      })
    },
  })
}

export const useUpdateTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagValues }) =>
      updateTag(id, data),
    onSuccess: (updatedTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('¡Etiqueta actualizada!', {
        description: `La etiqueta "${updatedTag.name}" se actualizó correctamente.`
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la etiqueta', {
        description: error.message
      })
    },
  })
}

export const useDeleteTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Etiqueta eliminada', {
        description: 'La etiqueta se eliminó correctamente.'
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la etiqueta', {
        description: error.message
      })
    },
  })
}

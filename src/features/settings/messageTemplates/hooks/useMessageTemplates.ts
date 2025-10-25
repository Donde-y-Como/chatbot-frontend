import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createMessageTemplate,
  deleteMessageTemplate,
  getMessageTemplates,
  getMessageTemplateById,
  updateMessageTemplate,
} from '../messageTemplatesService'
import { MessageTemplate, MessageTemplateFormValues, UpdateMessageTemplateValues, templateTypeLabels } from '../types'

export const useGetMessageTemplates = () => {
  return useQuery({
    queryKey: ['message-templates'],
    queryFn: getMessageTemplates,
    meta: {
      errorMessage: 'Error al cargar las plantillas de mensajes',
    },
  })
}

export const useGetMessageTemplate = (id: string) => {
  return useQuery({
    queryKey: ['message-templates', id],
    queryFn: () => getMessageTemplateById(id),
    enabled: !!id,
  })
}

export const useCreateMessageTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMessageTemplate,
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] })
      toast.success('¡Plantilla creada!', {
        description: `La plantilla para "${templateTypeLabels[newTemplate.type]}" se creó correctamente.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear la plantilla', {
        description: error.message,
      })
    },
  })
}

export const useUpdateMessageTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageTemplateValues }) =>
      updateMessageTemplate(id, data),
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] })
      toast.success('¡Plantilla actualizada!', {
        description: `La plantilla para "${templateTypeLabels[updatedTemplate.type]}" se actualizó correctamente.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la plantilla', {
        description: error.message,
      })
    },
  })
}

export const useDeleteMessageTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMessageTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] })
      toast.success('Plantilla eliminada', {
        description: 'La plantilla se eliminó correctamente.',
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la plantilla', {
        description: error.message,
      })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createConversationStatus,
  deleteConversationStatus,
  getConversationStatuses,
  getConversationStatusById,
  updateConversationStatus,
} from '../conversationStatusService'
import {
  ConversationStatusFormValues,
  UpdateConversationStatusValues,
} from '../types'

export const useGetConversationStatuses = () => {
  return useQuery({
    queryKey: ['conversation-statuses'],
    queryFn: getConversationStatuses,
    meta: {
      errorMessage: 'Error al cargar los estados de conversación',
    },
  })
}

export const useGetConversationStatus = (id: string) => {
  return useQuery({
    queryKey: ['conversation-statuses', id],
    queryFn: () => getConversationStatusById(id),
    enabled: !!id,
  })
}

export const useCreateConversationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createConversationStatus,
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-statuses'] })
      toast.success('¡Estado creado!', {
        description: `El estado "${newStatus.name}" se creó correctamente.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear el estado', {
        description: error.message,
      })
    },
  })
}

export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateConversationStatusValues
    }) => updateConversationStatus(id, data),
    onSuccess: (updatedStatus) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-statuses'] })
      toast.success('¡Estado actualizado!', {
        description: `El estado "${updatedStatus.name}" se actualizó correctamente.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el estado', {
        description: error.message,
      })
    },
  })
}

export const useDeleteConversationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteConversationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-statuses'] })
      toast.success('Estado eliminado', {
        description: 'El estado se eliminó correctamente.',
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el estado', {
        description: error.message,
      })
    },
  })
}

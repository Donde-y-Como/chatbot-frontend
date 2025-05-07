import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  QuickResponse,
  QuickResponseFormValues,
} from '@/features/settings/quickResponse/types.ts'
import {
  getQuickResponses,
  createQuickResponse,
  updateQuickResponse,
  deleteQuickResponse,
} from '../quickResponseService'

const QUICK_RESPONSES_KEY = ['quickResponses'] as const

export const useGetQuickResponses = () => {
  return useQuery({
    queryKey: QUICK_RESPONSES_KEY,
    queryFn: getQuickResponses,
  })
}

export const useCreateQuickResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: QuickResponseFormValues) => createQuickResponse(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUICK_RESPONSES_KEY })
      toast.success('Respuesta rápida creada', {
        description: 'La respuesta rápida se ha creado exitosamente',
      })
    },
    onError: () => {
      toast.error('Error', {
        description:
          'No se pudo crear la respuesta rápida. Intente nuevamente.',
      })
    },
  })
}

export const useUpdateQuickResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuickResponseFormValues }) =>
      updateQuickResponse(id, data as Partial<QuickResponse>),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUICK_RESPONSES_KEY })
      toast.success('Respuesta rápida actualizada', {
        description: 'La respuesta rápida se ha actualizado exitosamente',
      })
    },
    onError: () => {
      toast.error('Error', {
        description:
          'No se pudo actualizar la respuesta rápida. Intente nuevamente.',
      })
    },
  })
}

export const useDeleteQuickResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteQuickResponse(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUICK_RESPONSES_KEY })
      toast.success('Respuesta rápida eliminada', {
        description: 'La respuesta rápida se ha eliminado exitosamente',
      })
    },
    onError: () => {
      toast.error('Error', {
        description:
          'No se pudo eliminar la respuesta rápida. Intente nuevamente.',
      })
    },
  })
}

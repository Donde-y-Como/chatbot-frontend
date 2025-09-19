import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiAssistantService } from '../aiAssistantService'
import { CreateAIAssistantData, UpdateAIAssistantData } from '../types'

// Query key for AI Assistant
const AI_ASSISTANT_QUERY_KEY = ['ai-assistant', 'configuration']

// Get AI Assistant configuration
export const useGetAIAssistantConfig = () => {
  return useQuery({
    queryKey: AI_ASSISTANT_QUERY_KEY,
    queryFn: aiAssistantService.getConfiguration,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once since 404 is a valid response
  })
}

// Create AI Assistant configuration
export const useCreateAIAssistantConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAIAssistantData) =>
      aiAssistantService.createConfiguration(data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: AI_ASSISTANT_QUERY_KEY })
      toast.success(data.message || 'Configuración creada exitosamente')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
        'Error al crear la configuración del asistente'
      toast.error(message)
    },
  })
}

// Update AI Assistant configuration
export const useUpdateAIAssistantConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateAIAssistantData) =>
      aiAssistantService.updateConfiguration(data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: AI_ASSISTANT_QUERY_KEY })
      toast.success(data.message || 'Configuración actualizada exitosamente')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
        'Error al actualizar la configuración del asistente'
      toast.error(message)
    },
  })
}

// Delete AI Assistant configuration
export const useDeleteAIAssistantConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => aiAssistantService.deleteConfiguration(),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: AI_ASSISTANT_QUERY_KEY })
      toast.success(data.message || 'Configuración eliminada exitosamente')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
        'Error al eliminar la configuración del asistente'
      toast.error(message)
    },
  })
}
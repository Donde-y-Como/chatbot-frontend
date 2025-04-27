import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getQuickResponses,
  createQuickResponse,
  updateQuickResponse,
  deleteQuickResponse
} from '../quickResponseService';
import { CreateQuickResponseDto, UpdateQuickResponseDto } from '../types';

// Query key
const QUICK_RESPONSES_KEY = 'quickResponses';

// Hook to fetch all quick responses
export const useGetQuickResponses = () => {
  return useQuery({
    queryKey: [QUICK_RESPONSES_KEY],
    queryFn: getQuickResponses,
  });
};

// Hook to create a new quick response
export const useCreateQuickResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQuickResponseDto) => createQuickResponse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUICK_RESPONSES_KEY] });
      toast.success("Respuesta rápida creada", {
        description: "La respuesta rápida se ha creado exitosamente"
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: "No se pudo crear la respuesta rápida. Intente nuevamente."
      });
      console.error('Error creating quick response:', error);
    },
  });
};

// Hook to update an existing quick response
export const useUpdateQuickResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuickResponseDto }) => 
      updateQuickResponse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUICK_RESPONSES_KEY] });
      toast.success("Respuesta rápida actualizada", {
        description: "La respuesta rápida se ha actualizado exitosamente"
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: "No se pudo actualizar la respuesta rápida. Intente nuevamente."
      });
      console.error('Error updating quick response:', error);
    },
  });
};

// Hook to delete a quick response
export const useDeleteQuickResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteQuickResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUICK_RESPONSES_KEY] });
      toast.success("Respuesta rápida eliminada", {
        description: "La respuesta rápida se ha eliminado exitosamente"
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: "No se pudo eliminar la respuesta rápida. Intente nuevamente."
      });
      console.error('Error deleting quick response:', error);
    },
  });
};

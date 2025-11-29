import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TagApiService } from '../services/TagApiService';


export function useGetTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: TagApiService.findAll,
  })
}

export function useTagMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: ['tags', 'create'],
    async mutationFn({ name }: { name: string }) {
      return await TagApiService.create({ name })
    },
    onSuccess: () => {
      toast.success('Tag creado correctamente')
      queryClient.refetchQueries({ queryKey: ['tags'] })
    },
  })

  const importMutation = useMutation({
    mutationKey: ['tags', 'import'],
    async mutationFn({ override }: { override: boolean }) {
      return await TagApiService.importFromWhatsApp(override)
    },
    onSuccess: (_, variables) => {
      if (variables.override) {
        toast.success('Etiquetas sincronizadas correctamente con WhatsApp')
      } else {
        toast.success('Etiquetas importadas correctamente desde WhatsApp')
      }
      queryClient.refetchQueries({ queryKey: ['tags'] })
    },
    onError: () => {
      toast.error('Error al importar etiquetas desde WhatsApp')
    },
  })

  const create = async (name: string) => {
    await createMutation.mutateAsync({ name })
  }

  const importFromWhatsApp = async (override: boolean = false) => {
    await importMutation.mutateAsync({ override })
  }

  return { create, createMutation, importFromWhatsApp, importMutation }
}
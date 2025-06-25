import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { BundleApiService } from '../BundleApiService'
import { CreateBundleForm, EditBundleForm } from '../types'

export const useBundleMutations = () => {
  const queryClient = useQueryClient()

  const createBundle = useMutation({
    mutationFn: (bundle: CreateBundleForm) =>
      BundleApiService.createBundle(bundle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bundles'] })
      toast({
        title: 'Éxito',
        description: 'Paquete creado correctamente',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el paquete',
        variant: 'destructive',
      })
    },
  })

  const updateBundle = useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string
      changes: Partial<EditBundleForm>
    }) => BundleApiService.updateBundle(id, changes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bundles'] })
      toast({
        title: 'Éxito',
        description: 'Paquete actualizado correctamente',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar el paquete',
        variant: 'destructive',
      })
    },
  })

  const deleteBundle = useMutation({
    mutationFn: (bundleId: string) => BundleApiService.deleteBundle(bundleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bundles'] })
      toast({
        title: 'Éxito',
        description: 'Paquete eliminado correctamente',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar el paquete',
        variant: 'destructive',
      })
    },
  })

  return {
    createBundle,
    updateBundle,
    deleteBundle,
  }
}

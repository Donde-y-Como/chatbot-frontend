import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/features/auth/AuthService'
import { useAuthStore } from '@/stores/authStore'

export const useToggleNotifications = () => {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore((state) => state.auth)

  return useMutation({
    mutationFn: (enabled: boolean) => authService.toggleNotifications(enabled),
    onSuccess: async (data) => {
      // Actualizar el usuario en el store local
      if (user) {
        const updatedUser = { ...user, notificationsEnabled: data.notificationsEnabled }
        setUser(updatedUser)
      }

      // Invalidar y refetch queries para actualizar la vista inmediatamente
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['auth', 'business'] }),
        queryClient.refetchQueries({ queryKey: ['auth', 'business'] })
      ])

      toast.success(
        data.notificationsEnabled 
          ? 'Notificaciones habilitadas' 
          : 'Notificaciones deshabilitadas',
        {
          description: data.message,
        }
      )
    },
    onError: () => {
      toast.error('Error', {
        description: 'No se pudo actualizar el estado de las notificaciones. Intente nuevamente.',
      })
    },
  })
}

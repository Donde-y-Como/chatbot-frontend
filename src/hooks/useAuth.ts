import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/features/auth/AuthService'
import { 
  Role, 
  CreateRoleData, 
  UpdateRoleData, 
  UpdateCredentialsData,
  UserData,
  BusinessData
} from '@/features/auth/types'
import { useAuth } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'

// Auth data hooks
export const useGetMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useGetMyBusiness = () => {
  return useQuery({
    queryKey: ['auth', 'business'],
    queryFn: authService.getMyBusiness,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Roles hooks
export const useGetRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: authService.getRoles,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useGetRole = (roleId: string) => {
  return useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => authService.getRole(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: authService.getPermissions,
    staleTime: 10 * 60 * 1000, // 10 minutes (permissions don't change often)
  })
}

// Role mutations
export const useCreateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateRoleData) => authService.createRole(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast({
        title: 'Éxito',
        description: data.message,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al crear el rol',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleData }) => 
      authService.updateRole(roleId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] })
      toast({
        title: 'Éxito',
        description: data.message,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al actualizar el rol',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (roleId: string) => authService.deleteRole(roleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast({
        title: 'Éxito',
        description: data.message,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar el rol',
        variant: 'destructive',
      })
    },
  })
}

// Credentials update
export const useUpdateCredentials = () => {
  return useMutation({
    mutationFn: (data: UpdateCredentialsData) => authService.updateCredentials(data),
    onSuccess: (data) => {
      toast({
        title: 'Éxito',
        description: data.message,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al actualizar las credenciales',
        variant: 'destructive',
      })
    },
  })
}

// Permission utility hooks
export const useHasPermission = (permission: string) => {
  const { user } = useAuth()
  const { data: roles } = useGetRoles()
  
  // Owner has all permissions
  if (user?.isOwner) {
    return true
  }
  
  // Check if any of user's roles has the required permission
  if (!user?.roleIds || !roles) {
    return false
  }
  
  const userRoles = roles.filter(role => user.roleIds.includes(role.id))
  return userRoles.some(role => role.permissions.includes(permission))
}

export const useHasAnyPermission = (permissions: string[]) => {
  const { user } = useAuth()
  const { data: roles } = useGetRoles()
  
  // Owner has all permissions
  if (user?.isOwner) {
    return true
  }
  
  // Check if any of user's roles has any of the required permissions
  if (!user?.roleIds || !roles) {
    return false
  }
  
  const userRoles = roles.filter(role => user.roleIds.includes(role.id))
  const userPermissions = userRoles.flatMap(role => role.permissions)
  
  return permissions.some(permission => userPermissions.includes(permission))
}
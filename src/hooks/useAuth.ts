import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/stores/authStore'
import { authService } from '@/features/auth/AuthService'
import {
  CreateRoleData,
  UpdateCredentialsData,
  UpdateRoleData,
} from '@/features/auth/types'
import { Permission } from '@/api/permissions.ts'

// Auth data hooks
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
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Error al crear el rol')
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleData }) =>
      authService.updateRole(roleId, data),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
      void queryClient.invalidateQueries({
        queryKey: ['roles', variables.roleId],
      })
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Error al actualizar el rol')
    },
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: string) => authService.deleteRole(roleId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Error al eliminar el rol')
    },
  })
}

// Credentials update
export const useUpdateCredentials = () => {
  return useMutation({
    mutationFn: (data: UpdateCredentialsData) =>
      authService.updateCredentials(data),
    onSuccess: (data) => {
      toast(data.message)
    },
    onError: () => {
      toast.error('Error al actualizar las credenciales')
    },
  })
}

// Permission utility hooks
export const useHasPermission = (permission: Permission) => {
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

  const userRoles = roles.filter((role) => user.roleIds.includes(role.id))
  return userRoles.some((role) => role.permissions.includes(permission))
}

export const useHasAnyPermission = (permissions: Permission[]) => {
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

  const userRoles = roles.filter((role) => user.roleIds.includes(role.id))
  const userPermissions = userRoles.flatMap((role) => role.permissions)

  return permissions.some((permission) => userPermissions.includes(permission))
}

// Get all user permissions as a computed value
export const getUserPermissions = (user: any, roles: any[]) => {
  // Owner has all permissions
  if (user?.isOwner) {
    return ['*']
  }

  // Get permissions from user's roles
  if (!user?.roleIds || !roles) {
    return []
  }

  const userRoles = roles.filter((role) => user.roleIds.includes(role.id))
  const userPermissions = userRoles.flatMap((role) => role.permissions)

  // Remove duplicates
  return [...new Set(userPermissions)]
}

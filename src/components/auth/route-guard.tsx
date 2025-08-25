import { Navigate, useLocation } from '@tanstack/react-router'
import { ReactNode, useMemo } from 'react'
import { useAuth } from '@/stores/authStore'
import { useGetRoles, getUserPermissions } from '@/hooks/useAuth'
import { getRoutePermissions, hasRoutePermissions } from '@/lib/route-permissions'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: ReactNode
  requiredPermissions?: string[]
}

/**
 * RouteGuard component that checks user permissions before rendering content
 * Redirects to 403 (Forbidden) page if user doesn't have required permissions
 */
export function RouteGuard({ children, requiredPermissions }: RouteGuardProps) {
  const location = useLocation()
  const { user } = useAuth()
  const { data: roles, isLoading, error } = useGetRoles()

  // Calculate user permissions using useMemo to prevent re-renders
  const userPermissions = useMemo(() => {
    return getUserPermissions(user, roles || [])
  }, [user, roles])

  // Show loading spinner while fetching roles
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Verificando permisos...</span>
      </div>
    )
  }

  // If there's an error fetching roles, redirect to forbidden
  if (error) {
    console.error('Error fetching user roles:', error)
    return <Navigate to="/403" />
  }

  // Determine required permissions
  const permissions = requiredPermissions || getRoutePermissions(location.pathname)
  
  // If no permissions are required, allow access
  if (permissions.length === 0) {
    return <>{children}</>
  }

  // Check if user has required permissions
  // Handle owner wildcard permission
  const isOwner = userPermissions.includes('*')
  const hasAccess = isOwner || hasRoutePermissions(userPermissions, permissions)

  // If user doesn't have required permissions, redirect to forbidden page
  if (!hasAccess) {
    return <Navigate to="/403" />
  }

  // User has required permissions, render children
  return <>{children}</>
}

/**
 * Higher-order component wrapper for RouteGuard
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[]
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard requiredPermissions={requiredPermissions}>
        <Component {...props} />
      </RouteGuard>
    )
  }
}
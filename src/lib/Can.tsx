import { ReactNode } from 'react'
import { useHasPermission } from '@/hooks/useAuth.ts'
import { Permission } from '@/api/permissions.ts'

export function Can(
  permission: Permission,
  children: (allowed: boolean) => ReactNode
) {
  const allowed = useHasPermission(permission)

  return <>{children(allowed)}</>
}

export function RenderIfCan({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const allowed = useHasPermission(permission)

  if (!allowed) return null

  return <>{children}</>
}

import { ReactNode } from 'react'
import { useHasPermission } from '@/hooks/useAuth.ts'

export function Can(
  permission: string,
  children: (allowed: boolean) => ReactNode
) {
  const allowed = useHasPermission(permission);

  return <>{children(allowed)}</>;
}
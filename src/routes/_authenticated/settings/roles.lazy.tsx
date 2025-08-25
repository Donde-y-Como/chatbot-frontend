import { createLazyFileRoute } from '@tanstack/react-router'
import RolesSection from '@/features/settings/roles'

export const Route = createLazyFileRoute('/_authenticated/settings/roles')({
  component: RolesSection,
})

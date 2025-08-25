import { createLazyFileRoute } from '@tanstack/react-router'
import Dashboard from '@/features/dashboard/dashboard'

export const Route = createLazyFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})
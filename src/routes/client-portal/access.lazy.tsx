import { createLazyFileRoute } from '@tanstack/react-router'
import ClientPortal from '@/features/clients/components/client-portal'

export const Route = createLazyFileRoute('/client-portal/access')({
  component: ClientPortal,
})
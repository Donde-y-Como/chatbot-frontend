import { createLazyFileRoute } from '@tanstack/react-router'
import Services from '@/features/services'

export const Route = createLazyFileRoute('/_authenticated/servicios/')({
  component: Services,
})

import Store from '@/features/store'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/orden/')({
  component: Store,
})

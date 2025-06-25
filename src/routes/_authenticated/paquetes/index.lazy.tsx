import { createLazyFileRoute } from '@tanstack/react-router'
import Bundles from '@/features/bundles'

export const Route = createLazyFileRoute('/_authenticated/paquetes/')({
  component: Bundles,
})

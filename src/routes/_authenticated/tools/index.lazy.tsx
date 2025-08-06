import { createLazyFileRoute } from '@tanstack/react-router'
import Tools from '@/features/tools'

export const Route = createLazyFileRoute('/_authenticated/tools/')({
  component: Tools,
})

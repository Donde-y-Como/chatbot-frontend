import { createLazyFileRoute } from '@tanstack/react-router'
import QuickResponsesSection from '@/features/settings/quickResponse'

export const Route = createLazyFileRoute('/_authenticated/settings/quick-responses')({
  component: QuickResponsesSection,
})

import TagsSection from '@/features/settings/tags'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/tags')({
    component: TagsSection,
})

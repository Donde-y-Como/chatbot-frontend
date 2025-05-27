import CategoriesSection from '@/features/settings/categories'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/categories')(    {
        component: CategoriesSection,
    })


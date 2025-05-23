import { createLazyFileRoute } from '@tanstack/react-router'
import UnitsSection from '@/features/settings/units'

export const Route = createLazyFileRoute('/_authenticated/settings/units')({
    component: UnitsSection,
})


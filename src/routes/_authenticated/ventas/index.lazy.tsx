import SalesHistory from '@/features/sales/salesHistory.tsx'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/ventas/')({
    component: SalesHistory,
})

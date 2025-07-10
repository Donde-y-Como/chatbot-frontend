import SalesHistory from '@/features/history/sales'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/ventas/')({
    component: SalesHistory,
})

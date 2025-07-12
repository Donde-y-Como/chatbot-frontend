import OrdersHistory from '@/features/orders/ordersHistory.tsx'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/orden/historial')({
  component: OrdersHistory,
})

import { createLazyFileRoute } from '@tanstack/react-router'
import Employees from '@/features/employees'

export const Route = createLazyFileRoute('/_authenticated/empleados/')({
  component: Employees,
})

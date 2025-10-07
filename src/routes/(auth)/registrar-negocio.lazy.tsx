import { createLazyFileRoute } from '@tanstack/react-router'
import BusinessRegister from '@/features/auth/business-register'

export const Route = createLazyFileRoute('/(auth)/registrar-negocio')({
  component: BusinessRegister,
})

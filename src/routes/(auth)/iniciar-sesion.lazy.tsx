import { createLazyFileRoute } from '@tanstack/react-router'
import Login from '@/features/auth/login'

export const Route = createLazyFileRoute('/(auth)/iniciar-sesion')({
  component: Login,
})

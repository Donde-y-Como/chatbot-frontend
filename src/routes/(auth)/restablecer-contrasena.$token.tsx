import { createFileRoute } from '@tanstack/react-router'
import RecoverPassword from '../../features/auth/recover-password'

export const Route = createFileRoute(
  '/(auth)/restablecer-contrasena/$token',
)({
  component: RecoverPassword,
})
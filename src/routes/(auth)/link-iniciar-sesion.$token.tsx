import { createFileRoute } from '@tanstack/react-router'
import VerifyMagicLinkPage from '../../features/auth/verify-magic-link'

export const Route = createFileRoute('/(auth)/link-iniciar-sesion/$token')({
  component: VerifyMagicLinkPage,
})

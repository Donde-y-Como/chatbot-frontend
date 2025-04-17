import { createLazyFileRoute } from '@tanstack/react-router'
import SettingsWhatsappWeb from '@/features/settings/appearance'

export const Route = createLazyFileRoute('/_authenticated/settings/whatsapp')({
  component: SettingsWhatsappWeb,
})

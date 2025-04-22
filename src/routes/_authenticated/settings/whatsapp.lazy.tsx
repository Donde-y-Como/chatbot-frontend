import { createLazyFileRoute } from '@tanstack/react-router'
import SettingsWhatsappWeb from '@/features/settings/whatsappWeb'

export const Route = createLazyFileRoute('/_authenticated/settings/whatsapp')({
  component: SettingsWhatsappWeb,
})

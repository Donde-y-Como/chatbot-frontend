import { createLazyFileRoute } from '@tanstack/react-router'
import SettingsAiAssistant from '@/features/settings/aiAssistant'

export const Route = createLazyFileRoute('/_authenticated/settings/ai-assistant')({
  component: SettingsAiAssistant,
})
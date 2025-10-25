import MessageTemplatesSection from '@/features/settings/messageTemplates'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/message-templates')({
  component: MessageTemplatesSection,
})

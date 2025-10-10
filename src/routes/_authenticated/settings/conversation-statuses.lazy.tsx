import ConversationStatusSection from '@/features/chats/conversationStatus'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/settings/conversation-statuses'
)({
  component: ConversationStatusSection,
})

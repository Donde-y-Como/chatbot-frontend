import ContentSection from '../components/content-section'
import { NotificationsForm } from './notifications-form'

export default function SettingsNotifications() {
  return (
    <ContentSection
      title='Notificaciones'
      desc='Configura cómo recibes notificaciones.'
    >
      <NotificationsForm />
    </ContentSection>
  )
}

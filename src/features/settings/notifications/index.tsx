import { MaintenanceAlert } from '@/components/ui/maintenance-alert.tsx'
import ContentSection from '../components/content-section'
import { NotificationsForm } from './notifications-form'

export default function SettingsNotifications() {
  return (
    <ContentSection
      title='Notificaciones'
      desc='Configura cómo recibes notificaciones.'
    >
      <>
        <MaintenanceAlert
          type='maintenance'
          message={'Estamos trabajando para ofrecer esta funcionalidad'}
        />
        <br/>
        <NotificationsForm />
      </>
    </ContentSection>
  )
}

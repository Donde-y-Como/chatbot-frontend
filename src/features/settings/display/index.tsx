import { MaintenanceAlert } from '@/components/ui/maintenance-alert.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import ContentSection from '../components/content-section'
import { DisplayForm } from './display-form'

export default function SettingsDisplay() {
  return (
    <ContentSection
      title='Display'
      desc='Activa o desactiva elementos para controlar lo que se muestra en la aplicación.'
    >
      <>
        <MaintenanceAlert
          type='maintenance'
          message={'Estamos trabajando para ofrecer esta funcionalidad'}
        />
        <br />
        <ScrollArea className='-mx-4 flex-1 scroll-smooth px-4 md:pb-16'>
          <DisplayForm />
        </ScrollArea>
      </>
    </ContentSection>
  )
}

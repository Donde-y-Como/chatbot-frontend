import ContentSection from '../components/content-section'
import { DisplayForm } from './display-form'

export default function SettingsDisplay() {
  return (
    <ContentSection
      title='Display'
      desc="Activa o desactiva elementos para controlar lo que se muestra en la aplicación."
    >
      <DisplayForm />
    </ContentSection>
  )
}

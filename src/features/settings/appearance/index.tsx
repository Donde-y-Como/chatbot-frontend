import ContentSection from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export default function SettingsAppearance() {
  return (
    <ContentSection
      title='Apariencia'
      desc='Personaliza la apariencia de la app. Cambia automáticamente entre los temas Claro y Obscuro'
    >
      <AppearanceForm />
    </ContentSection>
  )
}

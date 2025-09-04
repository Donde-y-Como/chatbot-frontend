import ContentSection from '../components/content-section'
import { UnifiedWhatsApp } from './UnifiedWhatsApp'

export default function SettingsWhatsappWeb() {
  return (
    <ContentSection 
      title="WhatsApp" 
      desc="Gestiona tu conexión de WhatsApp"
    >
      <UnifiedWhatsApp />
    </ContentSection>
  )
}
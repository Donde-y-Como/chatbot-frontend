import ContentSection from '../components/content-section'
import { ConnectWhatsAppWeb } from './connect-whats-app-web.tsx'

export default function SettingsWhatsappWeb() {
  return (
    <ContentSection
      title='Conecta tu Whatsapp'
      desc='Conecta tu Whatsapp con codigo QR'
    >
      <ConnectWhatsAppWeb />
    </ContentSection>
  )
}

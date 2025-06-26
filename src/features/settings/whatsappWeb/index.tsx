import ContentSection from '../components/content-section'
import { ConnectWhatsApp } from './ConnectWhatsApp'
import { useWhatsApp } from './useWhatsApp'
import { ViewWhatsApp } from './ViewWhatsApp'

export default function SettingsWhatsappWeb() {
  const { isConnected: isWhatsAppConnected, isLoading: isWhatsAppLoading } = useWhatsApp();

  if (isWhatsAppLoading) {
    return <div>Recuperando sesion de whatsapp web...</div>
  }

  return (
    <ContentSection title='Sesion de Whatsapp Web' desc='Gestiona tu conexion'>
      {isWhatsAppConnected ? <ViewWhatsApp /> : <ConnectWhatsApp />}
    </ContentSection>
  )
}
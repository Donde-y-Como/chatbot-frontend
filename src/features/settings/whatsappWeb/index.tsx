import { useGetBusiness, useGetUser } from '@/components/layout/hooks/useGetUser.ts'
import { CreateWhatsAppInstance } from '@/features/settings/whatsappWeb/CreateWhatsAppInstance.tsx'
import ContentSection from '../components/content-section'
import { ConnectWhatsApp } from './ConnectWhatsApp'
import { ViewWhatsApp } from './ViewWhatsApp'
import { useWhatsApp } from './useWhatsApp'

export default function SettingsWhatsappWeb() {
  const { data: business, isLoading } = useGetBusiness()
  const { isConnected: isWhatsAppConnected, isLoading: isWhatsAppLoading } =
    useWhatsApp()

  if (isWhatsAppLoading || isLoading || !business) {
    return <div>Recuperando sesion de whatsapp web...</div>
  }

  if (!business.phone) {
    return (
      <ContentSection
        title='Whatsapp Web'
        desc='Para conectar tu cuenta de Whatsapp Web, primero debes tener un número de teléfono registrado.'
      >
        <CreateWhatsAppInstance />
      </ContentSection>
    )
  }

  return (
    <ContentSection title='Sesion de Whatsapp Web' desc='Gestiona tu conexion'>
      {isWhatsAppConnected ? <ViewWhatsApp /> : <ConnectWhatsApp />}
    </ContentSection>
  )
}

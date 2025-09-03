import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { useGetBusiness } from '@/components/layout/hooks/useGetUser.ts'
import { CreateWhatsAppInstance } from '@/features/settings/whatsappWeb/CreateWhatsAppInstance.tsx'
import ContentSection from '../components/content-section'
import { ConnectWhatsApp } from './ConnectWhatsApp'
import { ViewWhatsApp } from './ViewWhatsApp'
import { useWhatsApp } from './useWhatsApp'

export default function SettingsWhatsappWeb() {
  const { data: business, isLoading } = useGetBusiness()
  const { 
    isConnected: isWhatsAppConnected, 
    hasWhatsAppInstance,
    isLoading: isWhatsAppLoading,
    isError: isWhatsAppError 
  } = useWhatsApp()

  if (isLoading) {
    return <div>Cargando información del negocio...</div>
  }

  if (isWhatsAppLoading && !isWhatsAppError) {
    return <div>Recuperando sesion de whatsapp web...</div>
  }

  if(!business) {
    return <div>Cargando...</div>
  }

  // If there's no WhatsApp instance (404/400 from status endpoint), show phone form
  if (!hasWhatsAppInstance) {
    return (
      <ContentSection
        title='Whatsapp Web'
        desc='Para conectar tu cuenta de Whatsapp Web, primero debes registrar un número de teléfono.'
      >
        <RenderIfCan permission={PERMISSIONS.WHATSAPP_WEB_CONNECT}>
          <CreateWhatsAppInstance />
        </RenderIfCan>
      </ContentSection>
    )
  }

  // If WhatsApp instance exists, show connection status
  return (
    <ContentSection title='Sesion de Whatsapp Web' desc='Gestiona tu conexion'>
      {isWhatsAppConnected ? (
        <ViewWhatsApp />
      ) : (
        <RenderIfCan permission={PERMISSIONS.WHATSAPP_WEB_CONNECT}>
          <ConnectWhatsApp />
        </RenderIfCan>
      )}
    </ContentSection>
  )
}

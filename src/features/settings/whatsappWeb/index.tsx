import { useMemo } from 'react'
import { queryClient } from '@/hooks/use-web-socket.ts'
import {
  useGetUser,
  UserQueryKey,
} from '@/components/layout/hooks/useGetUser.ts'
import { UserData } from '@/features/auth/types.ts'
import { WhatsappWebSession } from '@/features/settings/whatsappWeb/whatsapp-web-session.tsx'
import ContentSection from '../components/content-section'
import { ConnectWhatsAppWeb } from './connect-whats-app-web.tsx'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'

export default function SettingsWhatsappWeb() {
  const { data: user } = useGetUser()

  const onCloseSession = async () => {
    if(!user) return;

    await baileysService.removeWhatsappWebSession(user)
  }

  const onSessionCreated = async () => {
    await queryClient.refetchQueries({ queryKey: UserQueryKey })
  }

  const whatsappWebSessionToken = useMemo(() => {
    if (!user) return false

    const platform = user.socialPlatforms.find(
      (p) => p.platformName === 'whatsappWeb'
    )

    return platform ? platform.token : false
  }, [user])

  return (
    <ContentSection
      title='Conecta tu Whatsapp'
      desc='Conecta tu Whatsapp con codigo QR'
    >
      {whatsappWebSessionToken ? (
        <WhatsappWebSession
          sessionId={whatsappWebSessionToken}
          onCloseSession={onCloseSession}
        />
      ) : (
        <ConnectWhatsAppWeb onSessionCreated={onSessionCreated} />
      )}
    </ContentSection>
  )
}

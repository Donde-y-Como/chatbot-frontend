import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  useGetUser,
  UserQueryKey,
} from '@/components/layout/hooks/useGetUser.ts'
import { PlatformName } from '@/features/clients/types.ts'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'
import { SessionData } from '@/features/settings/whatsappWeb/types.ts'
import { WhatsappWebSession } from '@/features/settings/whatsappWeb/whatsapp-web-session.tsx'
import ContentSection from '../components/content-section'

export default function SettingsWhatsappWeb() {
  const queryClient = useQueryClient()
  const { data: user } = useGetUser()
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchToken() {
      if (!user || user?.socialPlatforms.length <= 0) {
        setIsLoading(false)
        setSession(null)
        return
      }

      const platform = user.socialPlatforms.find(
        (p) => p.platformName === PlatformName.WhatsappWeb
      )

      if (!platform) {
        setIsLoading(false)
        setSession(null)
        return
      }

      const session = await baileysService.getCurrentSession(platform.token)

      if (session === null) {
        //await baileysService.removeWhatsappWebSession(user)
        localStorage.removeItem('sessionId')
        await queryClient.invalidateQueries({ queryKey: UserQueryKey })
        setIsLoading(false)
        setSession(null)
        return
      }

      localStorage.setItem('sessionId', session.data.id)
      setSession(session.data)
      setIsLoading(false)
    }

    fetchToken()
  }, [queryClient, user])

  if (isLoading) {
    return <div>Recuperando sesion de whatsapp web...</div>
  }

  return (
    <ContentSection title='Sesion de Whatsapp Web' desc='Gestiona tu conexion'>
      {session ? <WhatsappWebSession /> : <WhatsappTokenGenerator />}
    </ContentSection>
  )
}

function WhatsappTokenGenerator() {
  const queryClient = useQueryClient()
  const [platformId, setPlatformId] = useState<string>('')
  const [loading, setIsLoading] = useState(false)
  const createSession = useCallback(async () => {
    try {
      setIsLoading(true)

      if (platformId.length < 10) {
        toast.error('El numero telefonico debe ser de mas de 10 digitos')
        return
      }

      const response = await baileysService.createSession(platformId)
      if (response.success) {
        await baileysService.connectToBusiness(platformId, response.data.id)

        await queryClient.invalidateQueries({ queryKey: UserQueryKey })
      }
    } catch (e) {
      toast.error('No se pudo generar el codigo QR. Intenta mas tarde')
    }
    setIsLoading(false)
  }, [platformId, queryClient])

  return (
    <div className='flex flex-col gap-2 py-2'>
      <h2>Ingresa tu numero de telefono con codigo de pais</h2>
      <Input
        type='text'
        placeholder='52 1 951 201 0411'
        onChange={(e) => setPlatformId(e.target.value)}
        maxLength={14}
        value={platformId}
      />
      <Button
        onClick={createSession}
        disabled={loading || platformId.length < 10}
      >
        {loading ? (
          <>
            <Loader2 className='animate-spin' />
            Cargando
          </>
        ) : (
          'Generar codigo QR'
        )}
      </Button>
    </div>
  )
}

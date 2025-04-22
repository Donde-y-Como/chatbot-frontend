import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader2, SmartphoneNfc } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'
import {
  SessionData,
  SessionStatus,
} from '@/features/settings/whatsappWeb/types.ts'

export function ConnectWhatsAppWeb({
  onSessionCreated,
}: {
  onSessionCreated: () => Promise<void>
}) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createSession = async () => {
    try {
      setSessionStatus('creating')
      setError(null)

      const sessionData = await baileysService.createSession(phoneNumber)
      setSessionData(sessionData.data)
      setSessionStatus(sessionData.data.status)

      await fetchQRCode(sessionData.data.id)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo establecer conexion con whatsapp'
      )
      setSessionStatus('error')
      toast.error(
        err instanceof Error
          ? err.message
          : 'No se pudo establecer conexion con whatsapp'
      )
    }
  }

  const fetchQRCode = async (sessionId: string) => {
    try {
      setTimeout(async () => {
        const qrData = await baileysService.getQRCode(sessionId)
        setQrCode(qrData.qrCode)
        setSessionStatus('scanning')
        await baileysService.connectToBusiness(sessionId)
        setTimeout(async () => {
          await onSessionCreated()
        }, 5000)
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo obtener el codigo QR'
      )
      toast.error(
        err instanceof Error ? err.message : 'No se pudo obtener el codigo QR'
      )
    }
  }

  const renderContent = () => {
    switch (sessionStatus) {
      case 'idle':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Numero de WhatsApp</Label>
              <Input
                id='telefono'
                placeholder='521 000 000 0000'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className='text-sm text-muted-foreground'>
                Ingresa tu numero telefonico incluyendo el codigo del pais
              </p>
            </div>
            <Button
              onClick={createSession}
              disabled={!phoneNumber || phoneNumber.length < 10}
            >
              Conectar
            </Button>
          </div>
        )

      case 'creating':
      case 'starting':
        return (
          <div className='flex flex-col items-center justify-center space-y-4 py-8'>
            <Loader2 className='h-16 w-16 animate-spin text-primary' />
            <p className='text-center text-lg font-medium'>
              Creando session de whatsapp
            </p>
          </div>
        )

      case 'scanning':
        return (
          <div className='flex flex-col items-center justify-center space-y-4 py-4'>
            <div className='rounded-lg overflow-hidden border-2 border-primary p-1'>
              {qrCode ? (
                <img
                  src={qrCode}
                  alt='WhatsApp QR Code'
                  className='w-64 h-64'
                />
              ) : (
                <div className='w-64 h-64 flex items-center justify-center bg-muted'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
              )}
            </div>
            <div className='text-center'>
              <p className='text-lg font-medium'>
                Escanea con la aplicacion de whatsapp
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                Abre la aplicacion en tu celular y escanea este codigo QR
              </p>
            </div>
          </div>
        )

      case 'connecting':
        return (
          <div className='flex flex-col items-center justify-center space-y-4 py-8'>
            <SmartphoneNfc className='h-16 w-16 text-primary animate-pulse' />
            <p className='text-center text-lg font-medium'>Conectando...</p>
            <p className='text-sm text-muted-foreground text-center'>
              Por favor manten tu dispositivo conectado a internet
            </p>
          </div>
        )

      case 'connected':
        return (
          <div className='flex flex-col items-center justify-center space-y-4 py-8'>
            <CheckCircle className='h-16 w-16 text-green-600' />
            <p className='text-center text-lg font-medium'>
              Conectado a whatsapp
            </p>
            <p className='text-sm text-muted-foreground text-center'>
              Tu cuenta ahora recibirá los mensajes de tu whatsapp!
            </p>
          </div>
        )

      case 'disconnected':
        return (
          <div className='space-y-4'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Desconectado</AlertTitle>
              <AlertDescription>
                Tu conexion con whatsapp se cerro, intenta crearla de nuevo
              </AlertDescription>
            </Alert>
            <Button>Reconectar</Button>
          </div>
        )

      case 'error':
        return (
          <div className='space-y-4'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error de conexion</AlertTitle>
              <AlertDescription>
                {error || 'Ocurrio un error al conectarse a WhatsApp.'}
              </AlertDescription>
            </Alert>
            <Button>Reconectar</Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Conectar Whatsapp</CardTitle>
      </CardHeader>

      <CardContent>{renderContent()}</CardContent>

      {sessionStatus !== 'idle' &&
        sessionStatus !== 'creating' &&
        sessionStatus !== 'connected' && (
          <CardFooter className='flex justify-between'>
            <Button variant='outline'>Cancel</Button>
            {sessionStatus === 'scanning' && (
              <Button
                variant='ghost'
                onClick={() => sessionData?.id && fetchQRCode(sessionData.id)}
              >
                Refrescar codigo QR
              </Button>
            )}
          </CardFooter>
        )}
    </Card>
  )
}

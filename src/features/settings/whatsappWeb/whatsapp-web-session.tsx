import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Camera,
  Check,
  Loader,
  RefreshCw,
  WifiOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  useGetUser,
  UserQueryKey,
} from '@/components/layout/hooks/useGetUser.ts'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'
import { SessionStatus } from '@/features/settings/whatsappWeb/types.ts'
import { useGetWhatsAppWebSession } from '@/features/settings/whatsappWeb/useGetWhatsAppWebSession.ts'

const formatearFecha = (fechaStr: string) => {
  const fecha = new Date(fechaStr)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function WhatsappWebSession() {
  const queryClient = useQueryClient()
  const { data: session } = useGetWhatsAppWebSession()
  const { data: user } = useGetUser()

  const removeSession = async () => {
    if (!session) return

    const removed = await baileysService.stopSession(session.data.id)

    if (!removed || !user) {
      toast.error('Error al detener sesion')
      return
    }

    await baileysService.removeWhatsappWebSession(user)
    await queryClient.invalidateQueries({ queryKey: UserQueryKey })
  }

  const obtenerEstadoTexto = (status: SessionStatus) => {
    const estados = {
      creating: 'Creando sesión',
      starting: 'Iniciando sesión',
      scanning_qr: 'Esperando escaneo QR',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      stopped: 'Detenida desde el dispositivo',
      error: 'Error en la sesión',
    }
    return estados[status] || 'Estado desconocido'
  }

  const obtenerColorEstado = (status: SessionStatus) => {
    const colores = {
      creating: 'bg-blue-100 text-blue-700',
      starting: 'bg-blue-100 text-blue-700',
      scanning_qr: 'bg-yellow-100 text-yellow-700',
      connected: 'bg-green-100 text-green-700',
      disconnected: 'bg-gray-100 text-gray-700',
      stopped: 'bg-gray-100 text-gray-700',
      error: 'bg-red-100 text-red-700',
    }
    return colores[status] || 'bg-gray-100 text-gray-700'
  }

  const IconoEstado = ({ status }: { status: SessionStatus }) => {
    switch (status) {
      case 'creating':
        return <RefreshCw className='w-5 h-5 animate-spin' />
      case 'starting':
        return <Loader className='w-5 h-5 animate-spin' />
      case 'scanning_qr':
        return <Camera className='w-5 h-5' />
      case 'connected':
        return <Check className='w-5 h-5' />
      case 'disconnected':
      case 'stopped':
        return <WifiOff className='w-5 h-5' />
      case 'error':
        return <AlertCircle className='w-5 h-5' />
      default:
        return <AlertCircle className='w-5 h-5' />
    }
  }

  if (!session) {
    return (
      <div className='p-6 text-center'>
        <Alert variant='destructive' className='w-fit mx-auto'>
          <AlertCircle className='h-5 w-5' />
          <AlertTitle>Sesión no disponible</AlertTitle>
          <AlertDescription>
            No hay datos de sesión disponibles
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg px-6 py-4'>
        <h2 className='text-xl font-bold'>Información de Sesión</h2>
        <p className='text-sm text-blue-100'>ID: {session.data.id}</p>
      </CardHeader>

      <div
        className={`px-4 py-3 flex items-center ${obtenerColorEstado(session.data.status)}`}
      >
        <IconoEstado status={session.data.status} />
        <span className='ml-2 font-medium'>
          {obtenerEstadoTexto(session.data.status)}
        </span>
      </div>

      {session.data.status === 'scanning_qr' && session.data.qr && (
        <div className='p-6 flex justify-center bg-muted'>
          <div className='p-2 bg-background rounded shadow-sm'>
            <img
              src={session.data.qr}
              alt='Código QR para escanear'
              className='w-48 h-48'
            />
          </div>
        </div>
      )}

      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div>
            <Label className='text-muted-foreground'>Usuario</Label>
            <p className='mt-1'>{session.data.userId}</p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-muted-foreground'>Creado</Label>
              <p className='mt-1 text-sm'>
                {formatearFecha(session.data.createdAt)}
              </p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Último uso</Label>
              <p className='mt-1 text-sm'>
                {formatearFecha(session.data.lastUsed)}
              </p>
            </div>
          </div>

          {session.data.status === 'error' && (
            <Alert variant='destructive' className='mt-4'>
              <AlertTitle>Error de sesión</AlertTitle>
              <AlertDescription>
                Ocurrió un error con esta sesión. Por favor, inténtelo
                nuevamente o contacte con soporte.
              </AlertDescription>
            </Alert>
          )}

          {session.data.status === 'disconnected' && (
            <Alert className='mt-4 bg-muted text-muted-foreground'>
              <AlertTitle>Sesión desconectada</AlertTitle>
              <AlertDescription>
                La sesión se ha desconectado. Puede intentar reconectar o crear
                una nueva sesión.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <div className='px-6 py-4 bg-muted flex justify-end rounded-b-lg'>
        <Button onClick={removeSession} variant='destructive' size='sm'>
          Cerrar sesion
        </Button>
      </div>
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { TrashIcon } from '@radix-ui/react-icons'
import { Loader2, RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'
import {
  SessionData,
  SessionStatus,
} from '@/features/settings/whatsappWeb/types.ts'

export function WhatsappWebSession({ sessionId, onCloseSession}: { sessionId: string, onCloseSession: () => void }) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stopSession = async () => {
    try {
      setLoading(true)
      setError(null)
      await baileysService.stopSession(sessionId)
      setSession(null)
      onCloseSession()
    } catch (err) {
      setError('No se pudo detener la sesión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getSession = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await baileysService.getCurrentSession(sessionId)
      setSession(data)
    } catch (err) {
      setError('No se pudo obtener la información de la sesión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSession()
    // Actualizar cada 30 segundos si la sesión está conectando o escaneando
    const intervalId = setInterval(() => {
      if (session?.status === 'connecting' || session?.status === 'scanning') {
        getSession()
      }
    }, 30000)

    return () => clearInterval(intervalId)
  }, [sessionId, session?.status])

  // Función para formatear fechas a formato legible en español
  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr)
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(fecha)
    } catch {
      return fechaStr || 'N/A'
    }
  }

  // Obtener el color y texto según el estado de la sesión
  const getEstadoSesion = (status: SessionStatus) => {
    const estados = {
      idle: { color: 'bg-gray-200 text-gray-700', texto: 'Inactivo' },
      creating: { color: 'bg-blue-200 text-blue-700', texto: 'Creando' },
      starting: { color: 'bg-blue-200 text-blue-700', texto: 'Iniciando' },
      scanning: {
        color: 'bg-yellow-200 text-yellow-700',
        texto: 'Esperando escaneo QR',
      },
      connecting: {
        color: 'bg-yellow-200 text-yellow-700',
        texto: 'Conectando',
      },
      connected: { color: 'bg-green-200 text-green-700', texto: 'Conectado' },
      disconnected: { color: 'bg-red-200 text-red-700', texto: 'Desconectado' },
      error: { color: 'bg-red-200 text-red-700', texto: 'Error' },
    }
    return estados[status] || estados.idle
  }

  // Obtener el icono según el estado
  const getIconoEstado = (status: SessionStatus) => {
    switch (status) {
      case 'connected':
        return <Wifi className='w-4 h-4 mr-1' />
      case 'disconnected':
      case 'error':
        return <WifiOff className='w-4 h-4 mr-1' />
      case 'scanning':
      case 'connecting':
        return <Loader2 className='w-4 h-4 mr-1 animate-spin' />
      default:
        return <AlertTriangle className='w-4 h-4 mr-1' />
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto shadow-md'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl font-bold flex items-center'>
          WhatsApp Web
          {session?.status === 'connected' && (
            <Badge className='ml-2 bg-green-500'>Activo</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading && !session ? (
          <div className='flex justify-center items-center py-6'>
            <Loader2 className='w-8 h-8 animate-spin text-muted' />
            <span className='ml-2 text-foreground'>
              Cargando información...
            </span>
          </div>
        ) : error ? (
          <Alert variant='destructive' className='bg-red-100 border-red-300'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : session ? (
          <div className='space-y-4'>
            <div className='flex items-center'>
              <div className='flex items-center'>
                {getIconoEstado(session.status)}
                <Badge className={`${getEstadoSesion(session.status).color}`}>
                  {getEstadoSesion(session.status).texto}
                </Badge>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-2 text-sm'>
              <div className='flex justify-between'>
                <span className='font-medium text-foreground'>
                  ID de Sesión:
                </span>
                <span className='text-foreground text-xs'>{session.id}</span>
              </div>

              <div className='flex justify-between'>
                <span className='font-medium text-foreground'>
                  Numero telefonico:
                </span>
                <span className='text-foreground'>{session.userId}</span>
              </div>

              <div className='flex justify-between'>
                <span className='font-medium text-foreground'>Creado:</span>
                <span className='text-foreground'>
                  {formatearFecha(session.createdAt)}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='font-medium text-foreground'>Último uso:</span>
                <span className='text-foreground'>
                  {formatearFecha(session.lastUsed)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Alert className='bg-yellow-100 border-yellow-300'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>No hay información disponible</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className='pt-2 flex justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={getSession}
          disabled={loading}
          className='text-sm'
        >
          {loading ? (
            <>
              <Loader2 className='mr-1 h-3 w-3 animate-spin' />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className='mr-1 h-3 w-3' />
              Actualizar
            </>
          )}
        </Button>

        <Button
          variant='destructive'
          size='sm'
          onClick={stopSession}
          disabled={loading}
          className='text-sm'
        >
          {loading ? (
            <>
              <Loader2 className='mr-1 h-3 w-3 animate-spin' />
              Cargando...
            </>
          ) : (
            <>
              <TrashIcon className='mr-1 h-3 w-3' />
              Cerrar sesion
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

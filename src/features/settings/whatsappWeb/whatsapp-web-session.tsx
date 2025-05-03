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
import {
  useGetUser,
  UserQueryKey,
} from '@/components/layout/hooks/useGetUser.ts'
import { baileysService } from '@/features/settings/whatsappWeb/baileysService.ts'
import { SessionStatus } from '@/features/settings/whatsappWeb/types.ts'
import { useGetWhatsAppWebSession } from '@/features/settings/whatsappWeb/useGetWhatsAppWebSession.ts'

const formatearFecha = (fechaStr) => {
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
        <AlertCircle className='w-10 h-10 mx-auto text-red-500 mb-2' />
        <p className='text-lg font-medium text-gray-800'>
          No hay datos de sesión disponibles
        </p>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto'>
      <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4'>
        <h2 className='text-xl font-bold text-white'>Información de Sesión</h2>
        <p className='text-blue-100 text-sm'>ID: {session.data.id}</p>
      </div>

      <div
        className={`px-4 py-3 flex items-center ${obtenerColorEstado(session.data.status)}`}
      >
        <IconoEstado status={session.data.status} />
        <span className='ml-2 font-medium'>
          {obtenerEstadoTexto(session.data.status)}
        </span>
      </div>

      {session.data.status === 'scanning_qr' && session.data.qr && (
        <div className='p-6 flex justify-center bg-gray-50'>
          <div className='p-2 bg-white rounded shadow-md'>
            <img
              src={session.data.qr}
              alt='Código QR para escanear'
              className='w-48 h-48'
            />
          </div>
        </div>
      )}

      <div className='p-6'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-500'>
              Usuario
            </label>
            <p className='mt-1 text-gray-800'>{session.data.userId}</p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-500'>
                Creado
              </label>
              <p className='mt-1 text-sm text-gray-800'>
                {formatearFecha(session.data.createdAt)}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-500'>
                Último uso
              </label>
              <p className='mt-1 text-sm text-gray-800'>
                {formatearFecha(session.data.lastUsed)}
              </p>
            </div>
          </div>

          {session.data.status === 'error' && (
            <div className='mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm'>
              Ocurrió un error con esta sesión. Por favor, inténtelo nuevamente
              o contacte con soporte.
            </div>
          )}

          {session.data.status === 'disconnected' && (
            <div className='mt-4 p-3 bg-gray-50 text-gray-700 rounded-md text-sm'>
              La sesión se ha desconectado. Puede intentar reconectar o crear
              una nueva sesión.
            </div>
          )}
        </div>
      </div>

      <div className='px-6 py-4 bg-gray-50 flex justify-end'>
        <button
          onClick={removeSession}
          className='bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors'
        >
          Desconectar
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  ExternalLink,
  Loader2,
  MessageSquare,
  Shield,
  Unlink,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGetUser } from '@/components/layout/hooks/useGetUser.ts'
import { useDisconnectWhatsApp } from './useDisconnectWhatsApp'

export function ViewWhatsApp() {
  const { data: user } = useGetUser()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { disconnectWhatsApp } = useDisconnectWhatsApp()

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await disconnectWhatsApp()
      toast('WhatsApp desconectado')
    } catch (error) {
      toast.error('Error al desconectar WhatsApp. Intenta nuevamente.')
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card className='w-full max-w-lg mx-auto'>
      <CardHeader className='space-y-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
            <MessageSquare className='w-5 h-5 text-green-600' />
          </div>
          <div>
            <h2 className='text-xl font-semibold'>
              Cuenta de WhatsApp conectada
            </h2>
          </div>
        </div>
      </CardHeader>

      <div className='space-y-6 py-4'>
        {/* Account Details */}
        <div className='space-y-4'>
          <h4 className='font-semibold flex items-center'>
            <User className='w-4 h-4 mr-2' />
            Detalles de la cuenta
          </h4>

          <div className='grid gap-3'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <p className='text-sm font-medium text-gray-700'>
                Número de teléfono
              </p>
              <p className='text-sm text-gray-600'>{user?.phone}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security & Privacy */}
        <div className='space-y-3'>
          <h4 className='font-semibold flex items-center'>
            <Shield className='w-4 h-4 mr-2' />
            Seguridad y privacidad
          </h4>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <div className='flex items-start space-x-2'>
              <Shield className='w-4 h-4 text-blue-600 mt-0.5' />
              <div className='text-xs text-blue-800'>
                <p className='font-medium mb-1'>Conexión segura activa</p>
                <p>
                  Accede únicamente a los mensajes necesarios para brindarte
                  asistencia. Tus conversaciones están protegidas.
                </p>
              </div>
            </div>
          </div>

          <div className='text-xs text-muted-foreground space-y-1'>
            <p>• Puedes desconectar esta cuenta en cualquier momento</p>
            <p>• También puedes gestionar la conexión desde WhatsApp Web</p>
            <p>• Los datos se procesan de forma segura y privada</p>
          </div>
        </div>
      </div>

      <CardFooter className='flex flex-col sm:flex-row gap-2'>
        <div className='flex flex-1 gap-2'>
          <Button
            onClick={() => window.open('https://web.whatsapp.com', '_blank')}
            variant='outline'
            size='sm'
            className='flex-1 sm:flex-none'
          >
            <ExternalLink className='w-4 h-4 mr-2' />
            WhatsApp Web
          </Button>
        </div>

        <div className='flex gap-2 w-full sm:w-auto'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='sm'
                className='flex-1 sm:flex-none'
                disabled={isDisconnecting}
              >
                <Unlink className='w-4 h-4 mr-2' />
                Desconectar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Desconectar WhatsApp Web?</AlertDialogTitle>
                <AlertDialogDescription>
                  Perderás acceso a tus conversaciones de WhatsApp Web. Podrás
                  reconectar en cualquier momento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className='bg-red-600 hover:bg-red-700'
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Desconectando...
                    </>
                  ) : (
                    'Desconectar'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant='outline' size='sm' className='flex-1 sm:flex-none'>
            Cerrar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

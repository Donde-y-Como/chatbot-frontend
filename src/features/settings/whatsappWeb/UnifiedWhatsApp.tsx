import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Download,
  Edit,
  Info,
  Loader2,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  Save,
  Shield,
  Unlink,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  BusinessQueryKey,
  useGetBusiness,
  UserQueryKey,
} from '@/components/layout/hooks/useGetUser.ts'
import { useDisconnectWhatsApp } from './useDisconnectWhatsApp'
import { useWhatsApp } from './useWhatsApp'
import { WHATSAPP_QUERY_KEY } from './useWhatsAppData.ts'

export function UnifiedWhatsApp() {
  const { data: business } = useGetBusiness()
  const whatsappState = useWhatsApp()
  const { disconnectWhatsApp } = useDisconnectWhatsApp()
  const queryClient = useQueryClient()

  // Phone editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editedPhone, setEditedPhone] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)

  // Initialize edited phone when business data loads
  useEffect(() => {
    if (business?.phone && !editedPhone) {
      setEditedPhone(business.phone)
    }
  }, [business?.phone, editedPhone])

  // Create WhatsApp instance mutation
  const createInstanceMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      setIsCreatingInstance(true)
      await api.post('whatsapp-web/create', { phoneNumber })
    },
    onSuccess: async () => {
      toast.success('WhatsApp configurado', {
        description: 'Ahora puedes escanear el código QR',
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: UserQueryKey }),
        queryClient.invalidateQueries({ queryKey: BusinessQueryKey }),
        queryClient.invalidateQueries({ queryKey: WHATSAPP_QUERY_KEY }),
      ])
      setIsEditing(false)
      setIsCreatingInstance(false)
    },
    onError: (error: any) => {
      setIsCreatingInstance(false)
      const message =
        error?.response?.data?.message || 'Error al configurar WhatsApp'
      toast.error('Error de configuración', { description: message })
    },
  })

  const validatePhoneNumber = (phone: string): boolean => {
    setValidationError('')

    if (!phone.trim()) {
      setValidationError('El número es requerido')
      return false
    }

    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanPhone.length < 10) {
      setValidationError('El número debe tener al menos 10 dígitos')
      return false
    }

    if (cleanPhone.length > 15) {
      setValidationError('El número no puede tener más de 15 dígitos')
      return false
    }

    return true
  }

  const handlePhoneChange = (value: string) => {
    const formatted = value.replace(/[^\d\s]/g, '')
    setEditedPhone(formatted)
    if (validationError) {
      setValidationError('')
    }
  }

  const handleSavePhone = async () => {
    if (!validatePhoneNumber(editedPhone)) return

    const cleanPhone = editedPhone.replace(/\s/g, '')

    await createInstanceMutation.mutateAsync(cleanPhone)
  }

  const handleCancelEdit = () => {
    setEditedPhone(business?.phone || '')
    setIsEditing(false)
    setValidationError('')
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsApp()
      toast.success('WhatsApp desconectado', {
        description: 'Cuenta desvinculada correctamente',
      })
    } catch (error: any) {
      toast.error('Error al desconectar', {
        description: error?.response?.data?.message || 'Intenta nuevamente',
      })
    }
  }

  const handleRefreshQR = () => {
    whatsappState.retryFn()
  }

  const isPhoneDirty = editedPhone !== (business?.phone || '')
  const hasPhone = !!business?.phone
  const needsInitialSetup = !hasPhone || !whatsappState.hasWhatsAppInstance
  const canShowQR =
    hasPhone &&
    !isPhoneDirty &&
    whatsappState.hasWhatsAppInstance &&
    !whatsappState.isConnected
  const isProcessing = createInstanceMutation.isPending || isCreatingInstance

  return (
    <Card className='w-full max-w-6xl mx-auto'>
      <CardHeader className='space-y-3 pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                whatsappState.isConnected
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <MessageSquare
                className={`w-5 h-5 ${
                  whatsappState.isConnected
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              />
            </div>
            <div>
              <h2 className='text-xl font-semibold'>WhatsApp</h2>
              <p className='text-xs text-muted-foreground'>
                {whatsappState.isConnected
                  ? 'Conectado y funcionando'
                  : 'Gestiona tu conexión'}
              </p>
            </div>
          </div>

          {whatsappState.isConnected && (
            <Badge
              variant='default'
              className='bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 text-xs'
            >
              <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5' />
              En línea
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-4 md:space-y-3'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
          {/* Left Column - Phone & Status */}
          <div className='space-y-4 lg:space-y-3'>
            {/* Phone Number Section */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Número de WhatsApp</Label>

              {isEditing || needsInitialSetup ? (
                <div className='space-y-2'>
                  {needsInitialSetup && !isEditing && (
                    <Alert className='py-2.5'>
                      <Info className='h-4 w-4' />
                      <AlertDescription className='text-sm'>
                        <strong>Configuración inicial:</strong> Ingresa tu
                        número con código de país (ej: 521 para México).
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className='flex items-center space-x-2'>
                    <div className='relative flex-1'>
                      <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                      <Input
                        type='tel'
                        placeholder='521 95 1234 5678'
                        value={editedPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`pl-10 h-9 ${validationError ? 'border-red-300' : ''}`}
                        disabled={isProcessing}
                        autoComplete='tel'
                      />
                    </div>
                    <Button
                      onClick={handleSavePhone}
                      disabled={
                        !editedPhone ||
                        (!isPhoneDirty && hasPhone) ||
                        isProcessing ||
                        !!validationError
                      }
                      size='sm'
                      className='px-3'
                    >
                      {isProcessing ? (
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      ) : needsInitialSetup ? (
                        <>
                          <span className='hidden sm:inline'>Crear</span>
                          <ArrowRight className='w-3.5 h-3.5 sm:ml-1' />
                        </>
                      ) : (
                        <Save className='w-3.5 h-3.5' />
                      )}
                    </Button>
                    {!needsInitialSetup && (
                      <Button
                        onClick={handleCancelEdit}
                        variant='ghost'
                        size='sm'
                        className='px-3'
                        disabled={isProcessing}
                      >
                        <X className='w-3.5 h-3.5' />
                      </Button>
                    )}
                  </div>

                  {validationError && (
                    <div className='flex items-center space-x-1.5 text-red-600 dark:text-red-400'>
                      <AlertCircle className='h-3.5 w-3.5' />
                      <span className='text-xs'>{validationError}</span>
                    </div>
                  )}

                  {!validationError && (
                    <p className='text-xs text-muted-foreground'>
                      {needsInitialSetup
                        ? 'Al configurar se creará tu instancia de WhatsApp'
                        : 'Al cambiar se desconectará la sesión actual'}
                    </p>
                  )}

                  {/* Examples for initial setup */}
                  {needsInitialSetup && (
                    <div className='bg-muted/50 rounded-lg p-3 space-y-2'>
                      <h4 className='font-medium text-sm text-foreground'>
                        Ejemplos correctos:
                      </h4>
                      <div className='space-y-1.5 text-xs text-muted-foreground'>
                        <div className='flex items-center space-x-1.5'>
                          <CheckCircle2 className='h-3.5 w-3.5 text-green-500 dark:text-green-400' />
                          <code className='bg-background px-1.5 py-0.5 rounded border text-xs'>
                            521 55 1234 5678
                          </code>
                          <span>(CDMX)</span>
                        </div>
                        <div className='flex items-center space-x-1.5'>
                          <CheckCircle2 className='h-3.5 w-3.5 text-green-500 dark:text-green-400' />
                          <code className='bg-background px-1.5 py-0.5 rounded border text-xs'>
                            521 81 9876 5432
                          </code>
                          <span>(Monterrey)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex items-center justify-between p-2.5 bg-muted/50 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <Phone className='w-4 h-4 text-muted-foreground' />
                    <code className='text-sm font-mono'>
                      {business?.phone || 'No configurado'}
                    </code>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2'
                    disabled={whatsappState.isConnected} // Disable if connected, require disconnect first
                  >
                    <Edit className='w-3.5 h-3.5 mr-1' />
                    <span className='text-xs'>
                      {whatsappState.isConnected ? 'Cambiar*' : 'Editar'}
                    </span>
                  </Button>
                </div>
              )}

              {/* Note for connected users who want to change phone */}
              {!isEditing && whatsappState.isConnected && (
                <p className='text-xs text-muted-foreground mt-1'>
                  * Para cambiar el número, primero desconecta WhatsApp
                </p>
              )}
            </div>

            {whatsappState.isConnected ? (
              <div className='space-y-3'>
                <div className='p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800'>
                  <div className='flex items-center space-x-2.5'>
                    <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
                    <div>
                      <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                        WhatsApp conectado
                      </p>
                      <div className='flex flex-col lg:flex-row lg:items-center lg:space-x-4 mt-1 text-xs text-green-700 dark:text-green-300'>
                        <span>• Mensajes en tiempo real</span>
                        <span>• Conexión segura</span>
                        <span>• Acceso multiplataforma</span>
                      </div>
                    </div>
                  </div>
                </div>

                <RenderIfCan permission={PERMISSIONS.WHATSAPP_WEB_DISCONNECT}>
                  <div className='flex items-center justify-between p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/30 dark:bg-orange-950/20'>
                    <div className='flex items-center space-x-2'>
                      <AlertCircle className='w-4 h-4 text-orange-600 dark:text-orange-400' />
                      <span className='text-xs text-muted-foreground'>
                        Si hay problemas, desconecta y reconecta
                      </span>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='destructive'
                          size='sm'
                          className='h-7 px-3 text-xs'
                        >
                          <Unlink className='w-3.5 h-3.5 mr-1' />
                          Desconectar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='flex items-center space-x-2'>
                            <AlertCircle className='w-4 h-4 text-orange-500' />
                            <span className='text-base'>
                              ¿Desconectar WhatsApp?
                            </span>
                          </AlertDialogTitle>
                          <AlertDialogDescription className='space-y-2'>
                            <p className='text-sm'>
                              Perderás acceso a conversaciones desde esta
                              plataforma.
                            </p>
                            <div className='bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2.5'>
                              <ul className='text-xs text-orange-700 dark:text-orange-300 space-y-0.5'>
                                <li>• Cierre de sesión WhatsApp Web</li>
                                <li>• Sin mensajes en tiempo real</li>
                                <li>• Reconecta cuando quieras</li>
                              </ul>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className='text-sm'>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDisconnect}
                            className='bg-red-600 hover:bg-red-700 text-sm'
                          >
                            <Unlink className='w-3.5 h-3.5 mr-1.5' />
                            Desconectar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </RenderIfCan>
              </div>
            ) : null}
          </div>

          {/* Right Column - QR Code or Placeholder */}
          <div className='space-y-4 lg:space-y-3'>
            {!whatsappState.isConnected && (
              <div className='space-y-3'>
                {/* QR Code Section */}
                {canShowQR && whatsappState.qrCode ? (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <QrCode className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                        <span className='text-sm font-medium'>Código QR</span>
                      </div>

                      <Badge variant='secondary' className='text-xs'>
                        <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5' />
                        Activo
                      </Badge>
                    </div>

                    <div className='flex flex-col items-center space-y-3'>
                      <div className='relative group'>
                        <div className='bg-background p-3 lg:p-4 rounded-xl border-2 border-border shadow-md'>
                          <img
                            src={whatsappState.qrCode}
                            alt='Código QR para conectar WhatsApp'
                            className='w-40 h-40 sm:w-48 sm:h-48 lg:w-44 lg:h-44 xl:w-52 xl:h-52'
                          />
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm h-7 w-7 p-0'
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = whatsappState.qrCode || ''
                            link.download = 'whatsapp-qr-code.png'
                            link.click()
                          }}
                        >
                          <Download className='w-3 h-3' />
                        </Button>
                      </div>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleRefreshQR}
                        className='h-7 px-3 text-xs'
                      >
                        <RefreshCw className='w-3.5 h-3.5 mr-1.5' />
                        Actualizar código
                      </Button>
                    </div>

                    {/* Quick Instructions */}
                    <Alert className='py-2 lg:py-2.5'>
                      <QrCode className='h-4 w-4' />
                      <AlertDescription className='text-sm'>
                        <div className='space-y-1'>
                          <p className='font-medium'>Pasos rápidos:</p>
                          <p className='text-xs text-muted-foreground'>
                            1. Abre WhatsApp → 2. "Dispositivos vinculados" → 3.
                            Escanea código
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className='text-center py-6 lg:py-8 space-y-2'>
                    <div className='w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto'>
                      <QrCode className='w-6 h-6 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>
                        {needsInitialSetup
                          ? 'Configuración requerida'
                          : 'Esperando configuración'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {needsInitialSetup
                          ? 'Configura tu número para comenzar'
                          : isPhoneDirty
                            ? 'Guarda el número para generar código QR'
                            : 'Configurando conexión WhatsApp'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show placeholder for connected state on desktop */}
            {whatsappState.isConnected && (
              <div className='hidden lg:block text-center py-8 space-y-2'>
                <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto'>
                  <CheckCircle className='w-6 h-6 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                    Todo listo
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    WhatsApp conectado y funcionando
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice - Full Width */}
        <Alert className='py-2.5'>
          <Shield className='h-4 w-4' />
          <AlertDescription>
            <p className='font-medium text-sm'>Conexión segura y privada</p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              • Desconéctate cuando quieras
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

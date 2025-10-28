import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ClientApiService } from '../services/ClientApiService'
import { ClientPrimitives, SendPortalAccessLinkRequest } from '../types'
import { useAuthStore } from '@/stores/authStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Copy, Check, Link, Clock, MessageSquare, User, Info, CheckCircle2, Send } from 'lucide-react'
import { useGetBusiness } from '@/components/layout/hooks/useGetUser'

const sendPortalAccessSchema = z.object({
  expirationTimeInHours: z.number().min(1, 'Mínimo 1 hora').max(168, 'Máximo 7 días').default(24),
  customMessage: z.string().optional()
})

type SendPortalAccessForm = z.infer<typeof sendPortalAccessSchema>

interface SendPortalAccessDialogProps {
  client: ClientPrimitives | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendPortalAccessDialog({ client, open, onOpenChange }: SendPortalAccessDialogProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const {  data:business} = useGetBusiness()
  
  const form = useForm<SendPortalAccessForm>({
    resolver: zodResolver(sendPortalAccessSchema),
    defaultValues: {
      expirationTimeInHours: 24,
      customMessage: ''
    }
  })

  const sendAccessLinkMutation = useMutation({
    mutationFn: async (data: SendPortalAccessForm) => {
      if (!client || !business?.id) throw new Error('Cliente o negocio no disponible')
      
      const request: SendPortalAccessLinkRequest = {
        businessId: business.id,
        clientId: client.id,
        expirationTimeInHours: data.expirationTimeInHours,
        customMessage: data.customMessage
      }
      
      return ClientApiService.sendPortalAccessLink(client.id, request)
    },
    onSuccess: (response) => {
      setGeneratedLink(response.accessLink)
      toast.success('Enlace de acceso generado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al generar el enlace de acceso')
      console.error(error)
    }
  })

  const handleSubmit = (data: SendPortalAccessForm) => {
    sendAccessLinkMutation.mutate(data)
  }

  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setCopied(false)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Link className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl">Portal del Cliente</DialogTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Genera un enlace seguro para que <strong>{client?.name}</strong> pueda acceder a su portal personal.
          </p>
        </DialogHeader>
        
        {!generatedLink ? (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Cliente */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <Label htmlFor="client-name" className="text-sm font-medium">Cliente seleccionado</Label>
              </div>
              <Input
                id="client-name"
                value={client?.name || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Tiempo de expiración */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Label htmlFor="expiration" className="text-sm font-medium">Duración del acceso</Label>
              </div>
              <Input
                id="expiration"
                type="number"
                min="1"
                max="168"
                placeholder="24"
                {...form.register('expirationTimeInHours', { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <Info className="h-3 w-3" />
                <span>Entre 1 hora y 7 días (168 horas). Por defecto: 24 horas</span>
              </p>
              {form.formState.errors.expirationTimeInHours && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.expirationTimeInHours.message}
                </p>
              )}
            </div>

            {/* Mensaje personalizado */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <Label htmlFor="message" className="text-sm font-medium">
                  Mensaje personalizado
                  <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                </Label>
              </div>
              <Textarea
                id="message"
                placeholder="Ej: Hola, tu cita está confirmada. Accede a tu portal para ver los detalles..."
                {...form.register('customMessage')}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Si no escribes nada, se enviará un mensaje automático profesional.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={sendAccessLinkMutation.isPending}
                className="min-w-[140px]"
              >
                {sendAccessLinkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generar y Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Mensaje de éxito */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">¡Enlace generado exitosamente!</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  El mensaje ha sido enviado por WhatsApp a <strong>{client?.name}</strong>
                </p>
              </div>
            </div>

            {/* Enlace generado */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium">Enlace de acceso</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 text-sm font-mono border-gray-200 dark:border-gray-700"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                También puedes copiar este enlace para enviarlo por otros medios si es necesario.
              </p>
            </div>

            {/* Información del enlace */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Información del acceso
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • El enlace expirará en <strong>{form.getValues('expirationTimeInHours')} horas</strong>
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • Es personal e intransferible para {client?.name}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • Se envió automáticamente por WhatsApp
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button onClick={handleClose} className="min-w-[100px]">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
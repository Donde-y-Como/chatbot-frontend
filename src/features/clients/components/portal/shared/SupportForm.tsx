import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useClientPortalSupportRequest,
  useClientPortalContactInfo,
  SupportRequest
} from '../../../hooks/portal'
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  DollarSign,
  Settings
} from 'lucide-react'

interface SupportFormProps {
  clientId: string
  token: string
  onSuccess: () => void
  onCancel: () => void
}

export function SupportForm({ clientId, token, onSuccess, onCancel }: SupportFormProps) {
  const [subject, setSubject] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [category, setCategory] = useState<'general' | 'appointment' | 'billing' | 'technical'>('general')

  const supportMutation = useClientPortalSupportRequest(clientId, token)
  const { data: contactInfo, isLoading: contactLoading } = useClientPortalContactInfo(
    clientId,
    token,
    true
  )

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      return
    }

    const request: SupportRequest = {
      subject: subject.trim(),
      message: message.trim(),
      priority,
      category
    }

    try {
      const result = await supportMutation.mutateAsync(request)
      if (result.success) {
        // Clear form
        setSubject('')
        setMessage('')
        setPriority('medium')
        setCategory('general')
        onSuccess()
      }
    } catch (error) {
      // Error handling is done by the mutation
    }
  }

  const canSubmit = subject.trim() && message.trim()

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (c: string) => {
    switch (c) {
      case 'appointment': return <Calendar className="h-4 w-4" />
      case 'billing': return <DollarSign className="h-4 w-4" />
      case 'technical': return <Settings className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {supportMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <div>
                <span className="font-semibold">¡Solicitud enviada exitosamente!</span>
                {supportMutation.data?.ticketId && (
                  <p className="text-sm mt-1">
                    Número de ticket: <span className="font-mono">{supportMutation.data.ticketId}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {supportMutation.isError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <span>{supportMutation.error?.message || 'Error al enviar la solicitud'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Support Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Enviar solicitud de soporte</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría *
                </label>
                <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>Consulta general</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="appointment">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Citas y servicios</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="billing">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Facturación y pagos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="technical">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Soporte técnico</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Prioridad *
                </label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-green-500`}></div>
                        <span>Baja</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-yellow-500`}></div>
                        <span>Media</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-red-500`}></div>
                        <span>Alta</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Asunto *
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Describe brevemente tu consulta"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {subject.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mensaje *
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe tu consulta o problema en detalle. Incluye cualquier información que consideres relevante..."
                className="h-32"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/1000 caracteres
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || supportMutation.isPending}
              className="w-full"
            >
              {supportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar solicitud
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Información de contacto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contactLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Cargando información...</span>
              </div>
            ) : contactInfo ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Teléfono</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contactInfo.whatsapp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-semibold">Dirección</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Horarios de atención</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(contactInfo.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}:</span>
                        <span className="text-gray-600 dark:text-gray-400">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          Tiempo de respuesta
                        </p>
                        <p className="text-blue-600 dark:text-blue-400">
                          Respondemos a las solicitudes de soporte en un máximo de 24 horas durante días hábiles.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No se pudo cargar la información de contacto
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={supportMutation.isPending}
        >
          Volver
        </Button>
      </div>
    </div>
  )
}
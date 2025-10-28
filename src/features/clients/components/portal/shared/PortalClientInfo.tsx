import { User, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PortalClientInfoProps {
  clientName: string
  expiresAt: string
}

export function PortalClientInfo({ clientName, expiresAt }: PortalClientInfoProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg text-gray-900 dark:text-white">Tu Información</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>Nombre completo</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-lg">{clientName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Acceso válido hasta</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(expiresAt).toLocaleString('es-ES', {
                timeZone: 'America/Mexico_City',
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
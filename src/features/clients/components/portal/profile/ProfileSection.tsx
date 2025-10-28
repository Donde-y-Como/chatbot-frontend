import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useClientPortalProfile } from '../../../hooks/portal'
import { Loader2, User, Mail, Phone, Building2, CheckCircle2, Shield, Star } from 'lucide-react'

interface ProfileSectionProps {
  token: string
}

/**
 * ProfileSection - Muestra el perfil del cliente en el portal
 * Usa el endpoint GET /client-portal/profile
 */
export function ProfileSection({ token }: ProfileSectionProps) {
  const { data: profile, isLoading, error } = useClientPortalProfile(token, true)

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Cargando perfil...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-red-200">
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">Error al cargar el perfil</p>
        </CardContent>
      </Card>
    )
  }

  // Obtener iniciales del nombre
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Header decorativo */}
      <div className="absolute inset-0 h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900" />
      <div className="absolute inset-0 h-32 bg-grid-white/[0.05] bg-[size:20px_20px]" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
            <User className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Mi Perfil</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-8">
        <div className="space-y-6">
          {/* Profile Header with Avatar */}
          <div className="flex flex-col items-center -mt-16 mb-6">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h3>
              <Badge className="mt-2 bg-green-100 hover:bg-green-200 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">Estado</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Activo</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">Tipo</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Cliente</p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="grid gap-4">
            {/* Email */}
            <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                      Correo Electrónico
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                      Teléfono
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.phoneNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business ID (optional - for debugging/admin) */}
            {profile.businessId && (
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                        ID de Negocio
                      </p>
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                        {profile.businessId}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Footer */}
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Información protegida:</span> Si necesitas actualizar tu información, contacta con nuestro equipo de soporte
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

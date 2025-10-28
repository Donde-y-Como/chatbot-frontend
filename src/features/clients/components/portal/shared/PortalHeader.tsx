import { Shield, CheckCircle, Clock, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface PortalHeaderProps {
  clientName: string
  expiresAt: string
}

export function PortalHeader({ clientName, expiresAt }: PortalHeaderProps) {
  // Obtener iniciales del nombre
  const initials = clientName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative overflow-hidden">
      {/* Gradiente de fondo con patrón */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Decoraciones flotantes */}
      <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-lg p-1">
            <ThemeToggle />
          </div>
        </div>

        {/* Header Content */}
        <div className="text-center space-y-6">
          {/* Logo y Título */}
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
              <Shield className="h-10 w-10 text-white relative" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Portal del Cliente
              </h1>
              <p className="text-sm text-blue-100 dark:text-blue-200 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Gestiona tus servicios y citas
              </p>
            </div>
          </div>

          {/* Avatar y Bienvenida */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <Avatar className="h-16 w-16 border-4 border-white/20 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-xl font-semibold text-white">
                  ¡Bienvenido, {clientName}!
                </span>
              </div>
              <Badge className="mt-1 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1" />
                Acceso verificado y seguro
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoración inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12">
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            className="fill-gray-50 dark:fill-gray-900"
          />
        </svg>
      </div>
    </div>
  )
}
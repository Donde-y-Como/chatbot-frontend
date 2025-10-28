import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  PartyPopper,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Package,
  Wrench
} from 'lucide-react'
import { useClientPortalAppointments } from '../../../hooks/portal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAppointmentStatusConfig } from '@/features/appointments/types'
import { PortalSection } from '../shared/portalTypes'

interface DashboardSectionProps {
  token: string
  clientName: string
  onSectionChange: (section: PortalSection, target?: 'self' | 'other' | null) => void
}

export function DashboardSection({ token, clientName, onSectionChange }: DashboardSectionProps) {
  const { data: appointments, isLoading } = useClientPortalAppointments(token, true)

  // Próximas citas (próximos 30 días)
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return aptDate >= today && aptDate <= thirtyDaysFromNow && apt.status !== 'cancelada'
  }).slice(0, 3) || []

  // Estadísticas rápidas
  const stats = [
    {
      title: 'Citas Activas',
      value: appointments?.filter(a => a.status === 'pendiente' || a.status === 'confirmada').length || 0,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      onClick: () => onSectionChange('appointments')
    },
    {
      title: 'Próximas Citas',
      value: upcomingAppointments.length,
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      onClick: () => onSectionChange('appointments')
    },
    {
      title: 'Historial',
      value: appointments?.filter(a => a.status === 'completada').length || 0,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      onClick: () => onSectionChange('history')
    },
    {
      title: 'Servicios',
      value: '∞',
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      onClick: () => onSectionChange('orders')
    }
  ]

  const quickActions = [
    {
      title: 'Agendar Cita',
      description: 'Reserva una nueva cita',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      onClick: () => onSectionChange('booking', null),
      disabled: false
    },
    {
      title: 'Reservar Evento',
      description: 'Reserva para un evento especial',
      icon: PartyPopper,
      color: 'from-orange-500 to-orange-600',
      onClick: () => {},
      disabled: true
    },
    {
      title: 'Hacer Pedido',
      description: 'Solicita un servicio',
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      onClick: () => {},
      disabled: true
    }
  ]

  const formatTimeFromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ¡Bienvenido, {clientName.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Aquí está un resumen de tu actividad
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <div key={action.title} className="relative">
                  <Card
                    className={`border-0 shadow-md transition-all duration-300 bg-gradient-to-br ${action.color} text-white overflow-hidden group ${
                      action.disabled
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer hover:shadow-xl hover:scale-105'
                    }`}
                    onClick={action.disabled ? undefined : action.onClick}
                  >
                    <CardContent className="p-6 relative">
                      <div className="absolute -right-4 -top-4 opacity-20">
                        <Icon className="h-24 w-24" />
                      </div>
                      <div className="relative z-10">
                        <Icon className={`h-8 w-8 mb-3 ${!action.disabled && 'group-hover:scale-110'} transition-transform`} />
                        <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                        <p className="text-sm text-white/90">{action.description}</p>
                        {action.disabled ? (
                          <Wrench className="h-5 w-5 mt-3 text-white/80" />
                        ) : (
                          <ArrowRight className="h-5 w-5 mt-3 group-hover:translate-x-2 transition-transform" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Próximas Citas</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSectionChange('appointments')}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Ver todas
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                No tienes citas programadas
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSectionChange('booking', null)}
                className="mt-2"
              >
                Agendar una cita
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const statusConfig = getAppointmentStatusConfig(appointment.status)
                const serviceNames = appointment.services?.map(s => s.name).filter(Boolean) ||
                                   appointment.serviceNames || []
                const displayServiceName = serviceNames.length > 0
                  ? serviceNames.join(', ')
                  : 'Servicio no especificado'

                return (
                  <Card
                    key={appointment.id}
                    className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {displayServiceName}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: statusConfig.color,
                                color: statusConfig.color,
                                borderColor: statusConfig.color
                              }}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span className="capitalize">
                                {format(new Date(appointment.date), "EEEE, d 'de' MMMM", { locale: es })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatTimeFromMinutes(appointment.timeRange.startAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

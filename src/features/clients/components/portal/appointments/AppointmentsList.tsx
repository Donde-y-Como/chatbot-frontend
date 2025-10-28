import { useClientPortalAppointments } from '../../../hooks/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Loader2, User, MapPin, FileText } from 'lucide-react'
import { getAppointmentStatusConfig } from '@/features/appointments/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Separator } from '@/components/ui/separator'

interface AppointmentsListProps {
  token: string
}

export function AppointmentsList({ token }: AppointmentsListProps) {
  const { data: appointments, isLoading } = useClientPortalAppointments(token, true)

  const formatTimeFromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatAppointmentDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl">Mis Citas</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {appointments?.length ? `${appointments.length} citas programadas` : 'No hay citas'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Cargando citas...</span>
            </div>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const statusConfig = getAppointmentStatusConfig(appointment.status)

              // Obtener nombres de servicios desde el array services o usar serviceNames como fallback
              const serviceNames = appointment.services?.map(s => s.name).filter(Boolean) ||
                                   appointment.serviceNames || []
              const displayServiceName = serviceNames.length > 0
                ? serviceNames.join(', ')
                : 'Servicio no especificado'

              return (
                <Card key={appointment.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {displayServiceName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="font-medium"
                            style={{
                              backgroundColor: statusConfig.color,
                              color: statusConfig.color,
                              borderColor: statusConfig.color
                            }}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <FileText className="h-3 w-3" />
                          <span>Folio: <span className="font-mono font-medium">{appointment.folio}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Columna 1 */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                              Atendido por
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {appointment.employeesNames?.join(', ') || 'Por asignar'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                              Fecha
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {formatAppointmentDate(appointment.date)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Columna 2 */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                              Horario
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatTimeFromMinutes(appointment.timeRange.startAt)} - {formatTimeFromMinutes(appointment.timeRange.endAt)}
                            </p>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                                Notas
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {appointment.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tienes citas programadas
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Agenda tu primera cita para comenzar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

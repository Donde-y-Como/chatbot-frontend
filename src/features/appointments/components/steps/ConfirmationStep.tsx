import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientPrimitives } from '@/features/clients/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CalendarIcon, Scissors, User } from 'lucide-react'
import { useGetEmployees } from '../../hooks/useGetEmployees'
import { MinutesTimeRange, Service } from '../../types'
import { formatSlotHour } from '../../utils/formatters'

interface ConfirmationStepProps {
  date: Date
  timeRange: MinutesTimeRange
  selectedClient: ClientPrimitives | undefined
  selectedServices: Service[] | undefined
  selectedEmployeeIds: string[]
  loading: boolean
  onSubmit: () => void
  onBack: () => void
  onCancel: () => void
}

/**
 * Step 4: Confirmation component
 */
export function ConfirmationStep({
  date,
  timeRange,
  selectedClient,
  selectedServices = [],
  selectedEmployeeIds,
  loading,
  onSubmit,
  onBack,
  onCancel
}: ConfirmationStepProps) {
  const formattedTimeRange = `${formatSlotHour(timeRange.startAt)} - ${formatSlotHour(timeRange.endAt)}`;
  const { data: employees } = useGetEmployees()
  const selectedEmployees = employees ? employees.filter(emp => selectedEmployeeIds.includes(emp.id)) : [];

  return (
    <div className="space-y-4 ">
      <Card className='max-h-[40vh] overflow-auto'>
        <CardHeader className="pb-2">
          <CardTitle>Resumen de la Cita</CardTitle>
          <CardDescription>Verifica los detalles de tu cita</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 ">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <div className="flex items-center gap-2">
                {selectedClient && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedClient.photo} alt={selectedClient.name} className='object-cover' />
                    <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <p className="font-medium">{selectedClient?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Scissors className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Servicios</p>
              <div className="space-y-1 mt-1">
                {selectedServices.map(service => (
                  <p key={service.id} className="font-medium">{service.name}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha y Hora</p>
              <p className="font-medium">
                {format(date, 'PPPP', { locale: es })} • {formattedTimeRange}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                {selectedEmployees.length > 0 ? 'Empleados seleccionados' : 'Sin empleados específicos'}
              </p>
            </div>

            {selectedEmployees.length > 0 && (
              <div className="ml-7 space-y-2">
                {selectedEmployees.map(employee => (
                  <div key={employee.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={employee.photo} alt={employee.name} className='object-cover' />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2 mt-4">
        <div className="flex gap-2">
          <Button variant="destructive" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? 'Procesando...' : 'Confirmar Cita'}
        </Button>
      </div>
    </div>
  )
}

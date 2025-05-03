import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CalendarIcon, Scissors, User } from 'lucide-react'
import { Client, Service } from '../../types'
import { EmployeeAvailable } from '../../types'
import { formatSlotHour } from '../../utils/formatters'

interface ConfirmationStepProps {
  date: Date
  selectedClient: Client | undefined
  selectedService: Service | undefined
  selectedSlot: string | null
  selectedEmployees: EmployeeAvailable[]
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
  selectedClient,
  selectedService,
  selectedSlot,
  selectedEmployees,
  loading,
  onSubmit,
  onBack,
  onCancel
}: ConfirmationStepProps) {
  // Format slot time for display
  const selectedSlotTime = selectedSlot 
    ? `${formatSlotHour(JSON.parse(selectedSlot).startAt)} - ${formatSlotHour(JSON.parse(selectedSlot).endAt)}`
    : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resumen de la Cita</CardTitle>
          <CardDescription>Verifica los detalles de tu cita</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <div className="flex items-center gap-2">
                {selectedClient && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedClient.photo} alt={selectedClient.name} className='object-cover'/>
                    <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <p className="font-medium">{selectedClient?.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Servicio</p>
              <p className="font-medium">{selectedService?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha y Hora</p>
              <p className="font-medium">
                {format(date, 'PPPP', { locale: es })} • {selectedSlotTime}
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
            
            {selectedEmployees.length > 0 ? (
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
            ) : (
              <p className="ml-7 text-sm italic text-muted-foreground">
                Se asignará cualquier empleado disponible
              </p>
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

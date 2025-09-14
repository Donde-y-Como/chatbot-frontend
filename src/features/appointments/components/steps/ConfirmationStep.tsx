import React, { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CalendarIcon, DollarSignIcon, Scissors, User, CreditCard, FileText, CheckCircle, Wrench, Package, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card.tsx'
import { ClientPrimitives } from '@/features/clients/types'
import { useGetEmployees } from '../../hooks/useGetEmployees'
import { useEquipment } from '@/features/tools/hooks/useEquipment'
import { useConsumables } from '@/features/tools/hooks/useConsumables'
import { MinutesTimeRange, Service, AppointmentStatus, PaymentStatus, Deposit, ConsumableUsage, Reminder, Appointment } from '../../types'
import { formatSlotHour } from '../../utils/formatters'
import { AppointmentStatusBadge, PaymentStatusBadge } from '../StatusBadges'

interface ConfirmationStepProps {
  date: Date
  timeRange: MinutesTimeRange
  selectedClient: ClientPrimitives | undefined
  selectedServices: Service[] | undefined
  selectedEmployeeIds: string[]
  // Nuevos campos para mostrar en el resumen
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  deposit: Deposit | null
  notes: string
  // Nuevos campos para equipos y consumibles
  selectedEquipmentIds?: string[]
  consumableUsages?: ConsumableUsage[]
  // Campos de recordatorio
  reminder?: Reminder | null
  onReminderChange: (reminder: Reminder | null) => void
  loading: boolean
  onSubmit: () => void
  onBack: () => void
  onCancel: (e?: React.MouseEvent) => void
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
  status,
  paymentStatus,
  deposit,
  notes,
  selectedEquipmentIds = [],
  consumableUsages = [],
  reminder,
  onReminderChange,
  loading,
  onSubmit,
  onBack,
  onCancel,
}: ConfirmationStepProps) {
  const [enableReminders, setEnableReminders] = useState<boolean>(!!reminder)
  
  const formattedTimeRange = `${formatSlotHour(timeRange.startAt)} - ${formatSlotHour(timeRange.endAt)}`
  const { data: employees } = useGetEmployees()
  const { equipment } = useEquipment()
  const { consumables } = useConsumables()
  
  const selectedEmployees = employees
    ? employees.filter((emp) => selectedEmployeeIds.includes(emp.id))
    : []
    
  const selectedEquipment = equipment
    ? equipment.filter((eq) => selectedEquipmentIds.includes(eq.id))
    : []
    
  const selectedConsumables = consumables
    ? consumableUsages.map(usage => {
        const consumable = consumables.find(c => c.id === usage.consumableId)
        return consumable ? { ...consumable, quantity: usage.quantity } : null
      }).filter(Boolean)
    : []

  // Funciones para manejar recordatorios
  const handleEnableRemindersChange = (checked: boolean | string) => {
    const isChecked = checked === true || checked === 'true'
    setEnableReminders(isChecked)
    
    if (!isChecked) {
      // Si se desactiva el checkbox, enviar null para no incluir recordatorio
      onReminderChange(null)
    } else {
      // Inicializar con valores por defecto
      const today = new Date()
      const appointmentDate = new Date(date)
      
      // Calcular fecha por defecto: un día antes de la cita, pero no antes de hoy
      let defaultDate = new Date(appointmentDate)
      defaultDate.setDate(appointmentDate.getDate() - 1)
      
      // Si la fecha calculada es anterior a hoy, usar hoy como fecha mínima
      if (defaultDate < today) {
        defaultDate = new Date(today)
      }
      
      onReminderChange({
        day: defaultDate,
        time: '10:00',
        message: `¡Recordatorio de tu próxima cita!
📅 Fecha: ${format(date, 'PPPP', { locale: es })}
⏰ Horario: ${formattedTimeRange}
💼 Servicio(s): ${selectedServices.map(s => s.name).join(', ')}
Si necesitas cancelar o reagendar tu cita, por favor contáctanos con tiempo.
¡Te esperamos! 😊`,
        reminderSent: false
      })
    }
  }

  const handleReminderChange = (field: keyof Reminder, value: any) => {
    if (reminder) {
      onReminderChange({
        ...reminder,
        [field]: value
      })
    } else {
      // Si no hay reminder, crear uno nuevo con valores por defecto
      const today = new Date()
      const appointmentDate = new Date(date)
      
      // Calcular fecha por defecto: un día antes de la cita, pero no antes de hoy
      let defaultDate = new Date(appointmentDate)
      defaultDate.setDate(appointmentDate.getDate() - 1)
      
      // Si la fecha calculada es anterior a hoy, usar hoy como fecha mínima
      if (defaultDate < today) {
        defaultDate = new Date(today)
      }
      
      const newReminder: Reminder = {
        day: defaultDate,
        time: '10:00',
        message: `¡Recordatorio de tu próxima cita!
📅 Fecha: ${format(date, 'PPPP', { locale: es })}
⏰ Horario: ${formattedTimeRange}
💼 Servicio(s): ${selectedServices.map(s => s.name).join(', ')}
Si necesitas cancelar o reagendar tu cita, por favor contáctanos con tiempo.
¡Te esperamos! 😊`,
        reminderSent: false,
        [field]: value
      }
      
      onReminderChange(newReminder)
    }
  }

  return (
    <div className='space-y-4 '>
      <Card className='max-h-[40vh] overflow-auto'>
        <CardHeader className='pb-2'>
          <CardTitle>Resumen de la Cita</CardTitle>
          <CardDescription>Verifica los detalles de tu cita</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 '>
          <div className='flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            <div>
              <p className='text-sm text-muted-foreground'>Cliente</p>
              <div className='flex items-center gap-2'>
                {selectedClient && (
                  <Avatar className='h-6 w-6'>
                    <AvatarImage
                      src={selectedClient.photo}
                      alt={selectedClient.name}
                      className='object-cover'
                    />
                    <AvatarFallback>
                      {selectedClient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <p className='font-medium'>{selectedClient?.name}</p>
              </div>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <Scissors className='h-5 w-5 text-primary mt-1' />
            <div>
              <p className='text-sm text-muted-foreground'>Servicios</p>
              <div className='space-y-1 mt-1'>
                {selectedServices.map((service) => (
                  <p key={service.id} className='font-medium'>
                    {service.name}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <DollarSignIcon className='h-5 w-5 text-primary mt-1' />
            <div>
              <p className='text-sm text-muted-foreground'>Precio Total</p>
              <div className='space-y-1 mt-1'>
                <p className='font-medium text-lg'>
                  {selectedServices.length > 0 
                    ? `${selectedServices.reduce((total, service) => total + service.price.amount, 0).toFixed(2)} ${selectedServices[0]?.price.currency || ''}`
                    : '0.00'
                  }
                </p>
                {selectedServices.length > 1 && (
                  <p className='text-xs text-muted-foreground'>
                    ({selectedServices.length} servicios)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Abono/Depósito */}
          {deposit && deposit.amount > 0 && (
            <div className='flex items-start gap-2'>
              <CreditCard className='h-5 w-5 text-primary mt-1' />
              <div>
                <p className='text-sm text-muted-foreground'>Abono/Depósito</p>
                <div className='space-y-1 mt-1'>
                  <p className='font-medium text-lg text-green-600'>
                    {deposit.amount.toLocaleString('es-MX')} {deposit.currency}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Pagado por adelantado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estados */}
          <div className='flex items-start gap-2'>
            <CheckCircle className='h-5 w-5 text-primary mt-1' />
            <div>
              <p className='text-sm text-muted-foreground'>Estado de la Cita</p>
              <div className='flex gap-2 mt-1'>
                <AppointmentStatusBadge status={status} />
                <PaymentStatusBadge paymentStatus={paymentStatus} />
              </div>
            </div>
          </div>

          {/* Notas */}
          {notes && notes.trim() && (
            <div className='flex items-start gap-2'>
              <FileText className='h-5 w-5 text-primary mt-1' />
              <div>
                <p className='text-sm text-muted-foreground'>Notas</p>
                <div className='mt-1 p-2 bg-muted/50 rounded-md'>
                  <p className='text-sm'>{notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Equipos */}
          {selectedEquipment.length > 0 && (
            <div className='flex items-start gap-2'>
              <Wrench className='h-5 w-5 text-primary mt-1' />
              <div>
                <p className='text-sm text-muted-foreground'>Equipos</p>
                <div className='space-y-1 mt-1'>
                  {selectedEquipment.map((eq) => (
                    <div key={eq.id} className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {eq.name}
                      </Badge>
                      {eq.category && (
                        <span className='text-xs text-muted-foreground'>({eq.category})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Consumibles */}
          {selectedConsumables.length > 0 && (
            <div className='flex items-start gap-2'>
              <Package className='h-5 w-5 text-primary mt-1' />
              <div>
                <p className='text-sm text-muted-foreground'>Consumibles</p>
                <div className='space-y-1 mt-1'>
                  {selectedConsumables.map((consumable: any) => (
                    <div key={consumable.id} className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {consumable.name} x{consumable.quantity}
                      </Badge>
                      {consumable.category && (
                        <span className='text-xs text-muted-foreground'>({consumable.category})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5 text-primary' />
            <div>
              <p className='text-sm text-muted-foreground'>Fecha y Hora</p>
              <p className='font-medium'>
                {format(date, 'PPPP', { locale: es })} • {formattedTimeRange}
              </p>
            </div>
          </div>

          <div>
            <div className='flex items-center gap-2 mb-1'>
              <User className='h-5 w-5 text-primary' />
              <p className='text-sm text-muted-foreground'>
                {selectedEmployees.length > 0
                  ? 'Empleados seleccionados'
                  : 'Sin empleados específicos'}
              </p>
            </div>

            {selectedEmployees.length > 0 && (
              <div className='flex -space-x-2 items-center flex-wrap ml-7 '>
                {selectedEmployees.map((employee, index) => (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Avatar
                        className='ring-2 ring-foreground/50 cursor-pointer transition-transform hover:scale-105 hover:z-10'
                        style={{
                          zIndex: 5 - index,
                        }}
                      >
                        <AvatarImage
                          src={employee.photo}
                          alt={employee.name}
                          className='object-cover'
                        />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-80'>
                      <div className='flex space-x-4'>
                        <Avatar>
                          <AvatarImage
                            src={employee.photo}
                            alt={employee.name}
                            className='object-cover'
                          />
                          <AvatarFallback>
                            {employee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className=' flex-1 overflow-hidden'>
                          <h4 className='text-sm font-semibold truncate'>
                            {employee.name}
                          </h4>
                          <h4 className='text-xd truncate'>
                            {employee.email}
                          </h4>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Recordatorios */}
          <div className='border-t pt-4 mt-4'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Checkbox 
                  id='enable-reminders'
                  checked={enableReminders}
                  onCheckedChange={handleEnableRemindersChange}
                />
                <Label htmlFor='enable-reminders' className='text-sm font-medium cursor-pointer'>
                  <div className='flex items-center gap-2'>
                    <Bell className='h-4 w-4 text-primary' />
                    Configurar recordatorio
                  </div>
                </Label>
              </div>

              {enableReminders && (
                <div className='ml-6 space-y-3 p-3 bg-muted/30 rounded-lg border'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <Label htmlFor='reminder-date' className='text-xs text-muted-foreground'>Fecha del recordatorio</Label>
                      <Input
                        id='reminder-date'
                        type='date'
                        min={new Date().toISOString().split('T')[0]}
                        max={date.toISOString().split('T')[0]}
                        value={reminder?.day instanceof Date ? reminder.day.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleReminderChange('day', new Date(e.target.value))}
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='reminder-time' className='text-xs text-muted-foreground'>Hora del recordatorio</Label>
                      <Input
                        id='reminder-time'
                        type='time'
                        value={reminder?.time || '10:00'}
                        onChange={(e) => handleReminderChange('time', e.target.value)}
                        className='mt-1'
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='reminder-message' className='text-xs text-muted-foreground'>Mensaje del recordatorio</Label>
                    <Textarea
                      id="reminder-message"
                      value={reminder?.message || `¡Recordatorio de tu próxima cita!
📅 Fecha: ${format(date, 'PPPP', { locale: es })}
⏰ Horario: ${formattedTimeRange}
💼 Servicio(s): ${selectedServices.map(s => s.name).join(', ')}
Si necesitas cancelar o reagendar tu cita, por favor contáctanos con tiempo.
¡Te esperamos! 😊`}
                      onChange={(e) => handleReminderChange('message', e.target.value)}
                      rows={6}
                      className="mt-1 w-full border p-2"
                    />
                  </div>
                  {/* <div className='text-xs text-muted-foreground'>
                    💡 El recordatorio se enviará automáticamente en la fecha y hora especificada.
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-between gap-2 mt-4'>
        <div className='flex gap-2'>
          <Button variant='destructive' onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant='outline' onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className='bg-primary hover:bg-primary/90'
        >
          {loading ? 'Procesando...' : 'Confirmar Cita'}
        </Button>
      </div>
    </div>
  )
}

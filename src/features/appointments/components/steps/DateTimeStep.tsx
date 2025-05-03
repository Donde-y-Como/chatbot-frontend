import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatSlotHour } from '../../utils/formatters'
import { MinutesTimeRange, EmployeeAvailable } from '../../types'
import { Clock } from 'lucide-react'
import { es } from 'date-fns/locale/es'

interface DateTimeStepProps {
  date: Date
  onDateChange: (date: Date) => void
  availableSlots: { slot: MinutesTimeRange; employees: EmployeeAvailable[] }[]
  selectedSlot: string | null
  onSlotSelect: (slot: string) => void
  loading: boolean
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

/**
 * Step 2: Date and time selection component
 */
export function DateTimeStep({
  date,
  onDateChange,
  availableSlots,
  selectedSlot,
  onSlotSelect,
  loading,
  onNext,
  onBack,
  onCancel
}: DateTimeStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Fecha</label>
          <div className="border rounded-md p-1">
            <Calendar
              required
              locale={es}
              mode="single"
              selected={date}
              onSelect={(d) => onDateChange(d as Date)}
              className="w-full"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Horarios Disponibles {loading && "(Cargando...)"}
          </label>
          <ScrollArea className="h-64 border rounded-md p-2">
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.slot.startAt}
                    variant={selectedSlot === JSON.stringify(slot.slot) ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => onSlotSelect(JSON.stringify(slot.slot))}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {formatSlotHour(slot.slot.startAt)} - {formatSlotHour(slot.slot.endAt)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Clock className="h-8 w-8 mb-2" />
                <p className="text-center">
                  {loading 
                    ? "Cargando horarios disponibles..." 
                    : "No hay horarios disponibles para esta fecha"
                  }
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

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
          disabled={!selectedSlot || loading}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

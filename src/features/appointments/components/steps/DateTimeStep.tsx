import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { formatSlotHour } from '../../utils/formatters'
import { MinutesTimeRange } from '../../types'
import { Clock } from 'lucide-react'
import { es } from 'date-fns/locale/es'
import { Label } from '@/components/ui/label'

interface DateTimeStepProps {
  date: Date
  onDateChange: (date: Date) => void
  timeRange: MinutesTimeRange
  onTimeRangeChange: (timeRange: MinutesTimeRange) => void
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

/**
 * Step 2: Date and time selection component
 * Now allows manual input of time range
 */
export function DateTimeStep({
  date,
  onDateChange,
  timeRange,
  onTimeRangeChange,
  onNext,
  onBack,
  onCancel
}: DateTimeStepProps) {
  // Convert minutes to HH:MM format for input
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Convert HH:MM format to minutes for state
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartAt = timeToMinutes(e.target.value);
    onTimeRangeChange({ ...timeRange, startAt: newStartAt });
  }

  // Handle end time change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndAt = timeToMinutes(e.target.value);
    onTimeRangeChange({ ...timeRange, endAt: newEndAt });
  }

  return (
    <div className="space-y-4 h-[22rem]">
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
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Horario</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={minutesToTime(timeRange.startAt)}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={minutesToTime(timeRange.endAt)}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-md bg-muted/20">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              Resumen de horario
            </h3>
            <p className="text-sm text-muted-foreground">
              La cita será agendada desde las {formatSlotHour(timeRange.startAt)} hasta las {formatSlotHour(timeRange.endAt)}.
            </p>
            {timeRange.endAt <= timeRange.startAt && (
              <p className="text-sm text-destructive mt-2">
                La hora de fin debe ser posterior a la hora de inicio.
              </p>
            )}
          </div>
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
          disabled={timeRange.endAt <= timeRange.startAt}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

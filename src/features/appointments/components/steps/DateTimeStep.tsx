import React, { useState } from 'react'
import { isToday, setMinutes, format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Clock, AlertCircle, CalendarRange } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts'
import { MinutesTimeRange } from '../../types'
import {
  formatSlotHour,
  isValidAppointmentDate,
  getPastDateErrorMessage,
} from '../../utils/formatters'

interface DateTimeStepProps {
  date: Date
  endDate?: Date
  onDateChange: (date: Date) => void
  onEndDateChange: (endDate: Date | undefined) => void
  timeRange: MinutesTimeRange
  onTimeRangeChange: (timeRange: MinutesTimeRange) => void
  onNext: () => void
  onBack: () => void
  onCancel: (e?: React.MouseEvent) => void
}

/**
 * Step 2: Date and time selection component
 * Supports single-day and multi-day appointments
 */
export function DateTimeStep({
  date,
  endDate,
  onDateChange,
  onEndDateChange,
  timeRange,
  onTimeRangeChange,
  onNext,
  onBack,
  onCancel,
}: DateTimeStepProps) {
  const [dateError, setDateError] = useState<string | null>(null)
  const [isMultiDay, setIsMultiDay] = useState<boolean>(
    endDate !== undefined && !isSameDay(date, endDate)
  )

  // Convert minutes to HH:MM format for input
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Convert HH:MM format to minutes for state
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartAt = timeToMinutes(e.target.value)
    onTimeRangeChange({ ...timeRange, startAt: newStartAt })
  }

  // Handle end time change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndAt = timeToMinutes(e.target.value)
    onTimeRangeChange({ ...timeRange, endAt: newEndAt })
  }

  const { workHours } = useGetWorkSchedule(date)

  // Handle single date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return

    if (!isValidAppointmentDate(newDate)) {
      setDateError(getPastDateErrorMessage())
      return
    }

    setDateError(null)

    if (isToday(newDate)) {
      const today = new Date()
      onDateChange(
        setMinutes(newDate as Date, today.getMinutes() + today.getHours() * 60)
      )
    } else {
      onDateChange(
        setMinutes(newDate as Date, workHours ? workHours.startAt : 0)
      )
    }
  }

  // Handle date range selection for multi-day
  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) return

    if (range.from) {
      if (!isValidAppointmentDate(range.from)) {
        setDateError(getPastDateErrorMessage())
        return
      }
      setDateError(null)

      if (isToday(range.from)) {
        const today = new Date()
        onDateChange(
          setMinutes(range.from, today.getMinutes() + today.getHours() * 60)
        )
      } else {
        onDateChange(setMinutes(range.from, workHours ? workHours.startAt : 0))
      }
    }

    if (range.to) {
      if (!isValidAppointmentDate(range.to)) {
        setDateError('La fecha de fin no puede ser en el pasado')
        return
      }
      onEndDateChange(range.to)
    } else {
      onEndDateChange(undefined)
    }
  }

  const handleMultiDayToggle = (checked: boolean) => {
    setIsMultiDay(checked)
    if (!checked) {
      onEndDateChange(undefined)
    }
  }

  const disablePastDates = (checkDate: Date) => {
    return !isValidAppointmentDate(checkDate)
  }

  const isMultiDayAppointment =
    isMultiDay && endDate && !isSameDay(date, endDate)

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium block'>Fecha</label>
            <div className='flex items-center gap-2'>
              <CalendarRange className='h-4 w-4 text-muted-foreground' />
              <Label
                htmlFor='multi-day-toggle'
                className='text-xs text-muted-foreground cursor-pointer'
              >
                Multidía
              </Label>
              <Switch
                id='multi-day-toggle'
                checked={isMultiDay}
                onCheckedChange={handleMultiDayToggle}
              />
            </div>
          </div>
          {dateError && (
            <Alert variant='destructive' className='mb-2'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{dateError}</AlertDescription>
            </Alert>
          )}
          <div className='border rounded-md p-1'>
            {isMultiDay ? (
              <Calendar
                locale={es}
                mode='range'
                selected={{ from: date, to: endDate }}
                onSelect={handleRangeSelect}
                disabled={disablePastDates}
                className='w-full'
                numberOfMonths={1}
              />
            ) : (
              <Calendar
                required
                locale={es}
                mode='single'
                selected={date}
                onSelect={handleDateSelect}
                disabled={disablePastDates}
                className='w-full'
              />
            )}
          </div>

          {isMultiDayAppointment && (
            <div className='mt-2 p-3 bg-primary/5 border border-primary/20 rounded-md'>
              <p className='text-sm font-medium text-primary flex items-center gap-2'>
                <CalendarRange className='h-4 w-4' />
                Cita de múltiples días
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                {format(date, 'dd MMM yyyy', { locale: es })} →{' '}
                {format(endDate, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium mb-2 block'>Horario</label>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startTime'>Hora de inicio</Label>
                <Input
                  id='startTime'
                  type='time'
                  value={minutesToTime(timeRange.startAt)}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='endTime'>Hora de fin</Label>
                <Input
                  id='endTime'
                  type='time'
                  value={minutesToTime(timeRange.endAt)}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
          </div>

          <div className='p-4 border rounded-md bg-muted/20'>
            <h3 className='text-sm font-medium flex items-center gap-2 mb-2'>
              <Clock className='h-4 w-4' />
              Resumen de horario
            </h3>
            <p className='text-sm text-muted-foreground'>
              La cita será agendada desde las{' '}
              {formatSlotHour(timeRange.startAt)} hasta las{' '}
              {formatSlotHour(timeRange.endAt)}
              {isMultiDayAppointment && (
                <span className='block mt-1'>
                  Desde el {format(date, 'dd/MM/yyyy', { locale: es })} hasta el{' '}
                  {format(endDate, 'dd/MM/yyyy', { locale: es })}
                </span>
              )}
              .
            </p>
            {timeRange.endAt <= timeRange.startAt && (
              <p className='text-sm text-destructive mt-2'>
                La hora de fin debe ser posterior a la hora de inicio.
              </p>
            )}
          </div>
        </div>
      </div>

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
          disabled={timeRange.endAt <= timeRange.startAt || !!dateError}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

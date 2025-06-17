import { z } from 'zod'
import { MinutesTimeRange } from './types'

// Schema para cita rápida (solo campos básicos)
export const quickAppointmentSchema = z.object({
  clientId: z.string().min(1, { message: 'El cliente es requerido' }),
  serviceIds: z.array(z.string()).min(1, { message: 'Debe seleccionar al menos un servicio' }),
  date: z.date({ required_error: 'La fecha es requerida' }),
  startAt: z.number().min(0, { message: 'Hora de inicio inválida' }),
  endAt: z.number().min(0, { message: 'Hora de fin inválida' }),
}).refine(
  (data) => data.endAt > data.startAt,
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endAt'],
  }
)

export type QuickAppointmentFormValues = z.infer<typeof quickAppointmentSchema>

// Valores por defecto para cita rápida
export const getDefaultQuickAppointment = (): Partial<QuickAppointmentFormValues> => ({
  clientId: '',
  serviceIds: [],
  date: new Date(),
  startAt: 540, // 9:00 AM
  endAt: 600,   // 10:00 AM
})

// Utilidad para convertir minutos a hora formato HH:MM
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Utilidad para convertir hora formato HH:MM a minutos
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

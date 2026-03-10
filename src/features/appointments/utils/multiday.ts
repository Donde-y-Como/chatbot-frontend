import { eachDayOfInterval, isSameDay, startOfDay } from 'date-fns'
import type { Appointment } from '../types'

export type VisualAppointment = Appointment & {
  _multiDaySegment?: 'Inicio' | 'Fin' | 'Día cont.'
}

export function getVisualAppointments(
  appointments: Appointment[],
  workHours?: { startAt: number; endAt: number }
): VisualAppointment[] {
  const shopStart = workHours ? workHours.startAt : 0
  const shopEnd = workHours ? workHours.endAt : 1440

  return appointments.flatMap((appointment) => {
    const isMultiDay = appointment.endDate && !isSameDay(new Date(appointment.date), new Date(appointment.endDate))

    if (!isMultiDay) {
      return [appointment]
    }

    const startDate = startOfDay(new Date(appointment.date))
    const endDate = startOfDay(new Date(appointment.endDate!))
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map((day) => {
      const isFirst = isSameDay(day, startDate)
      const isLast = isSameDay(day, endDate)

      let startAt = shopStart
      let endAt = shopEnd
      let segment: 'Inicio' | 'Fin' | 'Día cont.' = 'Día cont.'

      if (isFirst) {
        startAt = Math.max(shopStart, appointment.timeRange.startAt)
        segment = 'Inicio'
      }
      if (isLast) {
        endAt = Math.min(shopEnd, appointment.timeRange.endAt)
        segment = 'Fin'
      }

      // If, because of clipping, the start is >= end, we either skip or set to 0. 
      // This happens if the appointment opens after close time somehow.
      if (startAt >= endAt) {
         startAt = shopStart;
         endAt = shopEnd;
      }

      return {
        ...appointment,
        date: day.toISOString(), // override the date to the current segmented day
        _multiDaySegment: segment,
        timeRange: { startAt, endAt }
      }
    })
  })
}

export function getVisualAppointmentsForDate(appointments: Appointment[], currentDate: Date): VisualAppointment[] {
  return getVisualAppointments(appointments).filter(app => isSameDay(new Date(app.date), currentDate))
}

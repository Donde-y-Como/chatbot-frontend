import { isSameDay } from 'date-fns'
import type { Appointment } from '../types'

export type VisualAppointment = Appointment & {
  _multiDaySegment?: 'Inicio' | 'Fin'
}

export function getVisualAppointments(appointments: Appointment[]): VisualAppointment[] {
  return appointments.flatMap((appointment) => {
    const isMultiDay = appointment.endDate && !isSameDay(new Date(appointment.date), new Date(appointment.endDate))

    if (!isMultiDay) {
      return [appointment]
    }

    const startAppt: VisualAppointment = {
      ...appointment,
      _multiDaySegment: 'Inicio',
      timeRange: {
        startAt: appointment.timeRange.startAt,
        endAt: appointment.timeRange.startAt + 30, // Force 30m duration
      },
    }

    const endAppt: VisualAppointment = {
      ...appointment,
      _multiDaySegment: 'Fin',
      date: appointment.endDate!, // Place it globally on its end day
      timeRange: {
        startAt: Math.max(0, appointment.timeRange.endAt - 30),
        endAt: appointment.timeRange.endAt,
      },
    }

    return [startAppt, endAppt]
  })
}

export function getVisualAppointmentsForDate(appointments: Appointment[], currentDate: Date): VisualAppointment[] {
  return getVisualAppointments(appointments).filter(app => isSameDay(new Date(app.date), currentDate))
}

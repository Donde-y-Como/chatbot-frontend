import { useMemo } from 'react'
import type { Appointment } from '@/features/appointments/types.ts'

interface PositionedAppointment {
  appointment: Appointment
  column: number
  totalColumns: number
}

export function usePositionedEvents({
                                            appointments,
                                            selectedService,
                                          }: {
  appointments: Appointment[]
  selectedService: string | 'all'
}) {
  // Filter appointments by service
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) =>
      selectedService === 'all' ? true : appointment.serviceId === selectedService
    )
  }, [appointments, selectedService])

  // Helper functions to compute start and end times in ms.
  // Assumes that timeRange.startAt and timeRange.endAt are in minutes.
  const getStartTime = (appointment: Appointment) => {
    const base = new Date(appointment.date).setHours(0, 0, 0, 0)
    return base + appointment.timeRange.startAt * 60000
  }

  const getEndTime = (appointment: Appointment) => {
    const base = new Date(appointment.date).setHours(0, 0, 0, 0)
    return base + appointment.timeRange.endAt * 60000
  }

  return useMemo(() => {
    const sorted = [...filteredAppointments].sort(
      (a, b) => getStartTime(a) - getStartTime(b)
    )
    const results: PositionedAppointment[] = []
    let currentGroup: Appointment[] = []
    let groupEnd = 0

    // Flush the current group by assigning each appointment a column.
    const flushGroup = () => {
      if (currentGroup.length === 0) return
      // `columns[i]` stores the end time of the last appointment in column i.
      const columns: number[] = []
      const groupResults: { appointment: Appointment; column: number }[] = []

      currentGroup.forEach((appt) => {
        const start = getStartTime(appt)
        const end = getEndTime(appt)
        let assigned = false
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= start) {
            columns[i] = end
            groupResults.push({ appointment: appt, column: i })
            assigned = true
            break
          }
        }
        if (!assigned) {
          // Create a new column if no existing column is free.
          columns.push(end)
          groupResults.push({ appointment: appt, column: columns.length - 1 })
        }
      })

      const totalColumns = columns.length
      groupResults.forEach((r) => {
        results.push({
          appointment: r.appointment,
          column: r.column,
          totalColumns,
        })
      })
      currentGroup = []
    }

    // Process each sorted appointment, grouping overlapping ones.
    sorted.forEach((appt) => {
      const start = getStartTime(appt)
      const end = getEndTime(appt)
      if (currentGroup.length === 0) {
        currentGroup.push(appt)
        groupEnd = end
      } else {
        // If the current appointment starts before the group ends, it's overlapping.
        if (start < groupEnd) {
          currentGroup.push(appt)
          groupEnd = Math.max(groupEnd, end)
        } else {
          // Otherwise, flush the current group and start a new one.
          flushGroup()
          currentGroup.push(appt)
          groupEnd = end
        }
      }
    })
    flushGroup()
    return results
  }, [filteredAppointments])
}

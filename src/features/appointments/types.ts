import { z } from 'zod'
import { Employee } from '../employees/types'

export interface Service {
  id: string
  businessId: string
  name: string
  description: string
  duration: {
    value: number
    unit: 'minutes' | 'hours'
  }
  price: {
    amount: number
    currency: string
  }
  maxConcurrentBooks: number
  minBookingLeadHours: number
}

export interface Schedule {
  id: string
  businessId: string
  weeklyWorkDays: Record<string, MinutesTimeRange>
  nonWorkDates: NonWorkDate[]
}

export interface NonWorkDate {
  date: Date
  reason: string
  recurrent: boolean
}

export interface MinutesTimeRange {
  startAt: number
  endAt: number
}

export type Event = {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  startTime: number
  endTime: number
  capacity: number | null
  price: number
  isLimited: boolean
  repeatEvery: 'never' | 'day' | 'week' | 'month' | 'year'
}

export type EmployeeAvailable = Pick<
  Employee,
  'id' | 'name' | 'email' | 'photo'
>

export const appointmentCreated = z.object({
  id: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  employeeId: z.string(),
  date: z.date(),
  timeRange: z.object({
    startAt: z.number(),
    endAt: z.number(),
  }),
  notes: z.string(),
  folio: z.string(),
})

export type AppointmentCreated = z.infer<typeof appointmentCreated>

export const appointment = z.object({
  _id: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  employeeId: z.string(),
  date: z.string(),
  timeRange: z.object({
    startAt: z.number(),
    endAt: z.number(),
  }),
  notes: z.string(),
  folio: z.string(),
  clientName: z.string(),
  serviceName: z.string(),
  employeeName: z.string(),
})

export type Appointment = z.infer<typeof appointment>

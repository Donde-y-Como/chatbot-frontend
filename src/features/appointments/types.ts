export interface Service {
  id:string
  name:string
}

export interface Employee {
  id: string
  name: string
  color: string
}

// Event type
export interface Event {
  id: string
  employeeId: string
  serviceId:string
  client: string
  service: string
  notes: string
  start: Date
  end: Date
  status: "scheduled" | "completed" | "cancelled"
}

import { z } from 'zod'

export const appointment = z.object({
  _id: z.string(),
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
  clientName: z.string(),
  serviceName: z.string(),
  employeeName: z.string(),
})

export type Appointment = z.infer<typeof appointment>
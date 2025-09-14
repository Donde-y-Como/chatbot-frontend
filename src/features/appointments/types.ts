import { z } from 'zod'
import { Employee } from '../employees/types'
import { ProductInfo } from '@/types'
import { Unit } from '../settings/units/types'

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
  schedule: Record<string, MinutesTimeRange>
  // Nuevos campos
  productInfo: ProductInfo
  codigoBarras: number
  unidadMedida: Unit
  photos: string[]
  // Campos de equipos y consumibles
  equipmentIds?: string[]
  consumableUsages?: ConsumableUsage[]
  reminders?: Reminder
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

// Nuevos tipos para estados y pago
export type AppointmentStatus = 
  | 'pendiente' 
  | 'confirmada' 
  | 'reprogramada' 
  | 'completada' 
  | 'cancelada' 
  | 'no asistió'

export type PaymentStatus = 
  | 'pendiente' 
  | 'pagado' 
  | 'parcial' 
  | 'reembolsado'

export interface Deposit {
  amount: number
  currency: string
}

export interface ConsumableUsage {
  consumableId: string
  quantity: number
}

export interface Reminder {
  day: Date
  time: string
  message: string
  reminderSent: boolean
}

// Reminder para enviar al API (con day como string)
export interface ReminderApiData {
  day: string // YYYY-MM-DD format
  time: string
  message: string
  reminderSent: boolean
}

export type EmployeeAvailable = Pick<
  Employee,
  'id' | 'name' | 'email' | 'photo'
>

export const appointmentCreated = z.object({
  id: z.string(),
  clientId: z.string(),
  serviceIds: z.array(z.string()),
  employeeIds: z.array(z.string()),
  date: z.date(),
  timeRange: z.object({
    startAt: z.number(),
    endAt: z.number(),
  }),
  notes: z.string(),
  folio: z.string(),
  // Nuevos campos opcionales
  status: z.enum(['pendiente', 'confirmada', 'reprogramada', 'completada', 'cancelada', 'no asistió']).optional(),
  paymentStatus: z.enum(['pendiente', 'pagado', 'parcial', 'reembolsado']).optional(),
  deposit: z.object({
    amount: z.number(),
    currency: z.string(),
  }).nullable().optional(),
  equipmentIds: z.array(z.string()).optional(),
  consumableUsages: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number(),
  })).optional(),
  reminder: z.object({
    day: z.date(), // Mantener como Date para consistencia con interface Reminder
    time: z.string(),
    message: z.string(),
    reminderSent: z.boolean(),
  }).optional(),
})

export type AppointmentCreated = z.infer<typeof appointmentCreated>

export const appointment = z.object({
  id: z.string(),
  clientId: z.string(),
  serviceIds: z.array(z.string()),
  employeeIds: z.array(z.string()),
  date: z.string(),
  timeRange: z.object({
    startAt: z.number(),
    endAt: z.number(),
  }),
  notes: z.string(),
  folio: z.string(),
  clientName: z.string(),
  serviceNames: z.array(z.string()),
  employeesNames: z.array(z.string()),
  // Nuevos campos con valores por defecto
  status: z.enum(['pendiente', 'confirmada', 'reprogramada', 'completada', 'cancelada', 'no asistió']).default('pendiente'),
  paymentStatus: z.enum(['pendiente', 'pagado', 'parcial', 'reembolsado']).default('pendiente'),
  deposit: z.object({
    amount: z.number(),
    currency: z.string(),
  }).nullable().default(null),
  equipmentIds: z.array(z.string()).default([]),
  consumableUsages: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number(),
  })).default([]),
  reminder: z.object({
    day: z.date(),
    time: z.string(),
    message: z.string(),
    reminderSent: z.boolean(),
  }).optional(),
  createdAt: z.string().default(""),
})

export type Appointment = z.infer<typeof appointment>

// Funciones utilitarias para obtener configuraciones de colores
export const getAppointmentStatusConfig = (status: AppointmentStatus) => {
  const configs = {
    pendiente: { label: 'Pendiente', color: '#6b7280', bgColor: '#f3f4f6' },
    confirmada: { label: 'Confirmada', color: '#3b82f6', bgColor: '#dbeafe' },
    reprogramada: { label: 'Reprogramada', color: '#f59e0b', bgColor: '#fef3c7' },
    completada: { label: 'Completada', color: '#10b981', bgColor: '#d1fae5' },
    cancelada: { label: 'Cancelada', color: '#ef4444', bgColor: '#fee2e2' },
    'no asistió': { label: 'No Asistió', color: '#ef4444', bgColor: '#fee2e2' }
  }
  return configs[status] || configs.pendiente
}

export const getPaymentStatusConfig = (paymentStatus: PaymentStatus) => {
  const configs = {
    pendiente: { label: 'Pago Pendiente', color: '#6b7280', bgColor: '#f3f4f6' },
    pagado: { label: 'Pagado', color: '#10b981', bgColor: '#d1fae5' },
    parcial: { label: 'Pago Parcial', color: '#f59e0b', bgColor: '#fef3c7' },
    reembolsado: { label: 'Reembolsado', color: '#ef4444', bgColor: '#fee2e2' }
  }
  return configs[paymentStatus] || configs.pendiente
}


// Tipo para los datos que se envían al API (con formatos de string)
export interface AppointmentApiData {
  clientId: string
  serviceIds: string[]
  employeeIds: string[]
  date: string // YYYY-MM-DD format
  timeRange: MinutesTimeRange
  notes: string
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  deposit: Deposit | null
  equipmentIds?: string[]
  consumableUsages?: ConsumableUsage[]
  reminder?: ReminderApiData
}

export type AvailabilityResult = {
  availableSlots: {
    slot: MinutesTimeRange,
    employees: EmployeeAvailable[]
  }[],
  bookedSlots: {
    slot: MinutesTimeRange,
    employees: EmployeeAvailable[]
  }[]
}
import { AppointmentStatus } from '@/features/appointments/types'

// ============================================
// Client Portal Appointments Types
// ============================================

export interface ClientPortalAppointment {
  id: string
  serviceIds: string[]
  employeeIds: string[]
  date: string
  timeRange: {
    startAt: number
    endAt: number
  }
  notes: string
  folio: string
  status: AppointmentStatus
  // Campos opcionales que el backend puede o no incluir
  clientName?: string
  serviceNames?: string[]
  employeesNames?: string[]
  createdAt?: string
  // El backend devuelve los servicios completos
  services?: Array<{
    id: string
    name: string
    description?: string
    duration?: {
      value: number
      unit: 'minutes' | 'hours'
    }
    price?: {
      amount: number
      currency: string
    }
  }>
}

export interface CreateClientPortalAppointmentRequest {
  serviceIds: string[]
  employeeIds: string[]
  date: string
  timeRange: {
    startAt: number
    endAt: number
  }
  notes?: string
}

// ============================================
// Client Portal Services Types
// ============================================

export interface ClientPortalService {
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
  photos: string[]
}

// ============================================
// Client Portal Profile Types
// ============================================

export interface ClientPortalProfile {
  id: string
  name: string
  email: string
  phoneNumber: string
  businessId: string
}

// ============================================
// Client Portal Availability Types
// ============================================

export interface CheckAvailabilityRequest {
  serviceIds: string[]
  employeeIds?: string[]
  date: string
  timeRange?: {
    startAt: number
    endAt: number
  }
}

export interface AvailabilityTimeSlot {
  startAt: number
  endAt: number
  available: boolean
  employees?: Array<{
    id: string
    name: string
    photo: string
  }>
}

export interface ClientPortalAvailabilityResponse {
  date: string
  availableSlots: AvailabilityTimeSlot[]
}


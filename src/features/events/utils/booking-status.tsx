import { Badge } from '@/components/ui/badge'
import { BookingStatus, PaymentStatus } from '../types'

// Mapeo de estados de reserva a etiquetas legibles
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  'pendiente': 'Pendiente',
  'confirmada': 'Confirmada',
  'reprogramada': 'Reprogramada',
  'completada': 'Completada',
  'cancelada': 'Cancelada',
  'no asistió': 'No Asistió'
}

// Mapeo de estados de pago a etiquetas legibles
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  'pendiente': 'Pendiente',
  'pagado': 'Pagado',
  'parcial': 'Parcial',
  'reembolsado': 'Reembolsado'
}

// Función para obtener el variant correcto del Badge según el estado de la reserva
export function getBookingStatusVariant(status: BookingStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'confirmada':
      return 'default'
    case 'pendiente':
      return 'secondary'
    case 'cancelada':
      return 'destructive'
    case 'completada':
      return 'outline'
    case 'reprogramada':
      return 'secondary'
    case 'no asistió':
      return 'destructive'
    default:
      return 'secondary'
  }
}

// Función para obtener el variant correcto del Badge según el estado del pago
export function getPaymentStatusVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pagado':
      return 'default'
    case 'pendiente':
      return 'secondary'
    case 'parcial':
      return 'outline'
    case 'reembolsado':
      return 'destructive'
    default:
      return 'secondary'
  }
}

// Componente Badge para estado de reserva
interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

export function BookingStatusBadge({ status, className = '' }: BookingStatusBadgeProps) {
  return (
    <Badge 
      variant={getBookingStatusVariant(status)}
      className={`text-xs ${className}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  )
}

// Componente Badge para estado de pago
interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  return (
    <Badge 
      variant={getPaymentStatusVariant(status)}
      className={`text-xs ${className}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}

// Validaciones de transición de estados (según los flujos recomendados)
export function isValidStatusTransition(fromStatus: BookingStatus, toStatus: BookingStatus): boolean {
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    'pendiente': ['confirmada', 'cancelada'],
    'confirmada': ['completada', 'cancelada', 'reprogramada', 'no asistió'],
    'reprogramada': ['confirmada', 'cancelada'],
    'completada': [], // Estado final
    'cancelada': [], // Estado final
    'no asistió': [] // Estado final
  }

  return validTransitions[fromStatus].includes(toStatus)
}

// Función para obtener los estados válidos siguientes
export function getValidNextStatuses(currentStatus: BookingStatus): BookingStatus[] {
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    'pendiente': ['confirmada', 'cancelada'],
    'confirmada': ['completada', 'cancelada', 'reprogramada', 'no asistió'],
    'reprogramada': ['confirmada', 'cancelada'],
    'completada': [], // Estado final
    'cancelada': [], // Estado final
    'no asistió': [] // Estado final
  }

  return validTransitions[currentStatus] || []
}

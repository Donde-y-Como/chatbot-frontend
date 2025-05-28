import { Badge } from '@/components/ui/badge'
import { AppointmentStatus, PaymentStatus, getAppointmentStatusConfig, getPaymentStatusConfig } from '../types'

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
}

interface PaymentStatusBadgeProps {
  paymentStatus: PaymentStatus
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = getAppointmentStatusConfig(status)
  
  return (
    <Badge 
      variant="outline"
      className="text-xs"
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.color + '40'
      }}
    >
      {config.label}
    </Badge>
  )
}

export function PaymentStatusBadge({ paymentStatus }: PaymentStatusBadgeProps) {
  const config = getPaymentStatusConfig(paymentStatus)
  
  return (
    <Badge 
      variant="outline"
      className="text-xs"
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.color + '40'
      }}
    >
      {config.label}
    </Badge>
  )
}
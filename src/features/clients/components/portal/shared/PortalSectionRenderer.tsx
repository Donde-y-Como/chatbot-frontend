import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { BookingForm } from '../appointments/BookingForm'
import { EventBookingForm } from '../events/EventBookingForm'
import { OrderForm } from '../orders/OrderForm'
import { SupportForm } from './SupportForm'
import { AppointmentsList } from '../appointments/AppointmentsList'
import { ServiceHistoryList } from '../orders/ServiceHistoryList'
import { EventsList } from '../events/EventsList'
import { EventHistoryList } from '../events/EventHistoryList'
import { OrderableServicesList } from '../orders/OrderableServicesList'
import { OrderHistoryList } from '../orders/OrderHistoryList'
import { ProfileSection } from '../profile/ProfileSection'
import { TargetSelector } from './TargetSelector'
import { PortalSection } from './portalTypes'

interface PortalSectionRendererProps {
  section: PortalSection
  selectedTarget: 'self' | 'other' | null
  clientId: string
  token: string
  onBack: () => void
  onTargetSelect: (target: 'self' | 'other') => void
  onSectionChange: (section: PortalSection) => void
}

export function PortalSectionRenderer({
  section,
  selectedTarget,
  clientId,
  token,
  onBack,
  onTargetSelect,
  onSectionChange
}: PortalSectionRendererProps) {
  if (section === 'overview') {
    return null
  }

  const renderBackButton = () => (
    <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
      <ArrowLeft className="h-4 w-4" />
      <span>Volver al inicio</span>
    </Button>
  )

  const renderTargetSelection = (
    onTargetClick: (target: 'self' | 'other') => void,
    title?: string,
    subtitle?: string
  ) => (
    <TargetSelector
      onTargetSelect={onTargetClick}
      title={title}
      subtitle={subtitle}
    />
  )

  switch (section) {
    case 'appointments':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <AppointmentsList token={token} />
        </div>
      )

    case 'booking':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          {!selectedTarget ? (
            renderTargetSelection(
              onTargetSelect,
              '¿Para quién es la cita?',
              'Selecciona si la cita es para ti o para otra persona'
            )
          ) : (
            <BookingForm
              clientId={clientId}
              token={token}
              isForOther={selectedTarget === 'other'}
              onSuccess={() => onSectionChange('appointments')}
              onCancel={onBack}
            />
          )}
        </div>
      )

    case 'history':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <ServiceHistoryList clientId={clientId} token={token} />
        </div>
      )

    case 'events':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <EventsList clientId={clientId} token={token} onBookEvent={() => onSectionChange('event-booking')} />
        </div>
      )

    case 'event-booking':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          {!selectedTarget ? (
            renderTargetSelection(
              onTargetSelect,
              '¿Para quién es la reserva del evento?',
              'Selecciona si vas a asistir tú o estás reservando para otra persona'
            )
          ) : (
            <EventBookingForm
              clientId={clientId}
              token={token}
              isForOther={selectedTarget === 'other'}
              onSuccess={() => onSectionChange('event-history')}
              onCancel={onBack}
            />
          )}
        </div>
      )

    case 'event-history':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <EventHistoryList clientId={clientId} token={token} />
        </div>
      )

    case 'orders':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <OrderableServicesList clientId={clientId} token={token} onCreateOrder={() => onSectionChange('order-create')} />
        </div>
      )

    case 'order-create':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          {!selectedTarget ? (
            renderTargetSelection(
              onTargetSelect,
              '¿Para quién es el pedido?',
              'Selecciona si el pedido es para ti o para otra persona'
            )
          ) : (
            <OrderForm
              clientId={clientId}
              token={token}
              isForOther={selectedTarget === 'other'}
              onSuccess={() => onSectionChange('order-history')}
              onCancel={onBack}
            />
          )}
        </div>
      )

    case 'order-history':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <OrderHistoryList clientId={clientId} token={token} />
        </div>
      )

    case 'support':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <SupportForm
            clientId={clientId}
            token={token}
            onSuccess={() => {}}
            onCancel={onBack}
          />
        </div>
      )

    case 'profile':
      return (
        <div className="space-y-6">
          {renderBackButton()}
          <ProfileSection token={token} />
        </div>
      )

    default:
      return null
  }
}
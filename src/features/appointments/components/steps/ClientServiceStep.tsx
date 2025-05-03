import { Button } from '@/components/ui/button'
import { CreateOrSelectClient } from '../CreateOrSelectClient'
import { CreateOrSelectService } from '../CreateOrSelectService'

interface ClientServiceStepProps {
  clientId: string
  serviceId: string
  onClientChange: (id: string) => void
  onServiceChange: (id: string) => void
  onNext: () => void
  onCancel: () => void
}

/**
 * Step 1: Client and Service selection component
 */
export function ClientServiceStep({
  clientId,
  serviceId,
  onClientChange,
  onServiceChange,
  onNext,
  onCancel
}: ClientServiceStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Cliente</label>
          <CreateOrSelectClient value={clientId} onChange={onClientChange} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Servicio</label>
          <CreateOrSelectService value={serviceId} onChange={onServiceChange} />
        </div>
      </div>

      <div className="flex justify-between gap-4 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          disabled={!clientId || !serviceId}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

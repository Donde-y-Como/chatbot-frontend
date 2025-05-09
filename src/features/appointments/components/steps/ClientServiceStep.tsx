import { Button } from '@/components/ui/button'
import { CreateOrSelectClient } from '../CreateOrSelectClient'
import { CreateOrSelectMultipleServices } from '../CreateOrSelectMultipleServices'

interface ClientServiceStepProps {
  clientId: string
  serviceIds: string[]
  onClientChange: (id: string) => void
  onServiceIdsChange: (ids: string[]) => void
  onServiceToggle: (id: string) => void
  onNext: () => void
  onCancel: () => void
}

/**
 * Step 1: Client and Service selection component
 */
export function ClientServiceStep({
  clientId,
  serviceIds,
  onClientChange,
  onServiceIdsChange,
  onServiceToggle,
  onNext,
  onCancel,
}: ClientServiceStepProps) {
  return (
    <div className='space-y-4 flex flex-col'>
      <div className='flex flex-col gap-4 flex-1'>
        <div>
          <label className='text-sm font-medium mb-1 block'>Cliente</label>
          <CreateOrSelectClient value={clientId} onChange={onClientChange} />
        </div>

        <div>
          <label className='text-sm font-medium mb-1 block'>Servicios</label>
          <CreateOrSelectMultipleServices
            selectedIds={serviceIds}
            onChange={onServiceIdsChange}
            onToggle={onServiceToggle}
          />
        </div>
      </div>

      <div className='flex justify-between gap-4'>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={!clientId || serviceIds.length === 0}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

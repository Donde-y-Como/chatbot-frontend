import { ChevronDown, ChevronUp } from 'lucide-react';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function PlanDetailsSection({ user, isPlanExpanded, setIsPlanExpanded }) {
  return (
    <div className="space-y-4">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between cursor-pointer">
        <div
          className="flex items-center space-x-2"
          onClick={() => setIsPlanExpanded(!isPlanExpanded)}
        >
          <h3 className="text-lg font-medium">Detalles del Plan</h3>
          {isPlanExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Conditional rendering of plan details */}
      {isPlanExpanded && (
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Paquete actual</FormLabel>
            <FormControl>
              <Input value={user?.plan?.name ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Estatus</FormLabel>
            <FormControl>
              <Input value={user?.plan?.status ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Mensajes incluidos</FormLabel>
            <FormControl>
              <Input value={user?.plan?.totalMessages ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Mensajes Restantes</FormLabel>
            <FormControl>
              <Input value={user?.plan?.leftMessages ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Mensajes Usados</FormLabel>
            <FormControl>
              <Input value={user?.plan?.usedMessages ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <FormControl>
              <Input value={user?.plan?.type ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Fecha de contratación</FormLabel>
            <FormControl>
              <Input
                value={
                  user?.plan?.startTimestamp
                    ? new Date(user.plan.startTimestamp).toLocaleDateString()
                    : 'No disponible'
                }
                readOnly
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Fecha de vencimiento</FormLabel>
            <FormControl>
              <Input
                value={
                  user?.plan?.endTimestamp
                    ? new Date(user.plan.endTimestamp).toLocaleDateString()
                    : 'No disponible'
                }
                readOnly
              />
            </FormControl>
          </FormItem>
        </div>
      )}
    </div>
  );
}
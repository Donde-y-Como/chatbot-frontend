import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle, User } from 'lucide-react'
import { EmployeeAvailable } from '../../types'

interface EmployeeSelectionStepProps {
  availableEmployees: EmployeeAvailable[]
  selectedEmployeeIds: string[]
  onEmployeeToggle: (employeeId: string) => void
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

/**
 * Step 3: Employee selection component
 */
export function EmployeeSelectionStep({
  availableEmployees,
  selectedEmployeeIds,
  onEmployeeToggle,
  onNext,
  onBack,
  onCancel
}: EmployeeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium block">Empleados (Opcional)</label>
        {selectedEmployeeIds.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => selectedEmployeeIds.forEach(id => onEmployeeToggle(id))}
            className="text-xs h-8"
          >
            Desmarcar todos
          </Button>
        )}
      </div>
      
      {availableEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableEmployees.map((employee) => (
            <Card 
              key={employee.id} 
              className={cn(
                "cursor-pointer hover:border-primary transition-all",
                { "border-primary bg-primary/5": selectedEmployeeIds.includes(employee.id) }
              )}
              onClick={() => onEmployeeToggle(employee.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.photo} alt={employee.name} className="object-cover"/>
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">Empleado</p>
                    </div>
                  </div>
                  {selectedEmployeeIds.includes(employee.id) && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md text-muted-foreground">
          <User className="h-8 w-8 mb-2" />
          <p className="text-center">No hay empleados disponibles para este horario</p>
          <p className="text-center text-sm mt-2">
            Puedes continuar sin seleccionar empleados y se asignará cualquiera disponible
          </p>
        </div>
      )}

      <div className="flex justify-between gap-2 mt-4">
        <div className="flex gap-2">
          <Button variant="destructive" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

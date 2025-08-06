import { cn } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

interface AppointmentStepIndicatorProps {
  activeStep: number
}

/**
 * Step indicator component for the appointment creation process
 */
export function AppointmentStepIndicator({ activeStep }: AppointmentStepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div 
            key={step} 
            className={cn(
              "flex flex-col items-center",
              { "text-primary": step <= activeStep },
              { "text-muted-foreground": step > activeStep }
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-background mb-1",
              { "bg-primary": step <= activeStep },
              { "bg-muted": step > activeStep }
            )}>
              {step < activeStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step
              )}
            </div>
            <span className="text-xs hidden sm:block text-center">
              {step === 1 && "Información"}
              {step === 2 && "Fecha y Hora"}
              {step === 3 && "Recursos"}
              {step === 4 && "Notas"}
              {step === 5 && "Estado y Pago"}
              {step === 6 && "Confirmación"}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500" 
          style={{ width: `${(activeStep / 6) * 100}%` }}
        />
      </div>
    </div>
  )
}

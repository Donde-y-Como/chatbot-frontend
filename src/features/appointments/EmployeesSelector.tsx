import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Employee } from '../employees/types'

type EmployeesSelectorProps = {
  isEmployeesOpen: boolean
  setIsEmployeesOpen: (isOpen: boolean) => void
  employees: Employee[]
  selectedEmployees: Set<string>
  setSelectedEmployees: (employees: Set<string>) => void
}

export function EmployeesSelector({
                                        isEmployeesOpen,
                                        setIsEmployeesOpen,
                                        employees,
                                        selectedEmployees,
                                        setSelectedEmployees,
                                      }: EmployeesSelectorProps) {
  return (
    <Collapsible
      open={isEmployeesOpen}
      onOpenChange={setIsEmployeesOpen}
      className='rounded-lg md:rounded-xl bg-card transition-all duration-300'
      role='group'
      aria-labelledby='employees-section-title'
    >
      <div className='flex items-center justify-between p-3 md:p-4'>
        <h4 className='font-semibold text-xs md:text-sm' id='employees-section-title'>Empleados</h4>
        <CollapsibleTrigger asChild>
          <Button 
            variant='ghost' 
            size='sm'
            className='h-6 w-6 md:h-8 md:w-8 p-0'
            aria-expanded={isEmployeesOpen}
            aria-label={isEmployeesOpen ? 'Ocultar lista de empleados' : 'Mostrar lista de empleados'}
          >
            <ChevronDown
              className={cn(
                'h-3 w-3 md:h-4 md:w-4 transition-transform duration-300',
                isEmployeesOpen ? 'rotate-0' : '-rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className='px-2 pb-2 md:p-2'>
        <div className='space-y-0.5 md:space-y-1'>
          {employees.map((employee: Employee) => (
            <label
              htmlFor={'check-' + employee.id}
              key={employee.id}
              className='flex items-center group p-2 md:p-3 rounded-md md:rounded-lg transition-all duration-200 hover:bg-muted/50 cursor-pointer'
            >
              <div className='transition-transform duration-200 group-hover:scale-105'>
                <Checkbox
                  id={'check-' + employee.id}
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={(checked) => {
                    const newSelected = new Set(selectedEmployees)
                    if (checked) newSelected.add(employee.id)
                    else newSelected.delete(employee.id)
                    setSelectedEmployees(newSelected)
                  }}
                  className='h-3 w-3 md:h-4 md:w-4'
                />
              </div>

              <div className='flex items-center gap-2 md:gap-3 ml-2 md:ml-3'>
                <div
                  className='w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-transform duration-200 group-hover:scale-110'
                  style={{ backgroundColor: employee.color }}
                />
                <span className='select-none cursor-pointer text-xs md:text-sm font-medium transition-colors duration-200 group-hover:text-primary truncate'>
                  {employee.name}
                </span>
              </div>
            </label>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

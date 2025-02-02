import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import type { Employee } from '@/features/appointments/types.ts'
import { Checkbox } from '@/components/ui/checkbox.tsx'

export function EmployeesSelector({
                                        isEmployeesOpen,
                                        setIsEmployeesOpen,
                                        employees,
                                        selectedEmployees,
                                        setSelectedEmployees,
                                      }) {
  return (
    <Collapsible
      open={isEmployeesOpen}
      onOpenChange={setIsEmployeesOpen}
      className='rounded-lg  border p-4 transition-all duration-300 hover:shadow-lg'
    >
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-primary/90'>Empleados</h3>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm'>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isEmployeesOpen ? 'rotate-0' : '-rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className='mt-2'>
        {employees.map((employee: Employee) => (
          <label
            htmlFor={'check-' + employee.id}
            key={employee.id}
            className='flex items-center group p-2 rounded-md transition-all duration-300 hover:bg-secondary/40 cursor-pointer'
          >
            <div className='transform transition-all duration-300 group-hover:scale-110'>
              <Checkbox
                id={'check-' + employee.id}
                checked={selectedEmployees.has(employee.id)}
                onCheckedChange={(checked) => {
                  const newSelected = new Set(selectedEmployees)
                  if (checked) newSelected.add(employee.id)
                  else newSelected.delete(employee.id)
                  setSelectedEmployees(newSelected)
                }}
              />
            </div>

            <p
              className='w-3 h-3 rounded-full ml-3 transition-transform duration-300 group-hover:scale-125'
              style={{ backgroundColor: employee.color }}
            ></p>
            <span className='select-none cursor-pointer ml-3 text-sm font-medium text-primary/80 transition-colors duration-300 group-hover:text-primary'>
              {employee.name}
            </span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

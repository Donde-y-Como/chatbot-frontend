import { FC, useState } from 'react'
import { es } from 'date-fns/locale/es'
import { ChevronDown, MenuIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { Employee, Service } from './types'

interface SidebarProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  employees: Employee[]
  selectedEmployees: Set<string>
  setSelectedEmployees: (employees: Set<string>) => void
  services: Service[]
  selectedServices: Set<string>
  setSelectedServices: (services: Set<string>) => void
  onCreateEvent: () => void
}

export const CalendarSidebar: FC<SidebarProps> = ({
  selectedDate,
  setSelectedDate,
  employees,
  selectedEmployees,
  setSelectedEmployees,
  onCreateEvent,
  services,
  setSelectedServices,
  selectedServices,
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(true)
  const [isServicesOpen, setIsServicesOpen] = useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        'bg-background border-r transition-all duration-300',
        isOpen ? 'w-72' : 'w-12'
      )}
    >
      <div className='p-4'>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm' className='w-full mb-4'>
            <MenuIcon
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen ? '' : 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className='space-y-4'>
          <Button className='w-full' onClick={onCreateEvent}>
            <Plus className='mr-2' /> Agendar
          </Button>

          <CalendarPicker
            locale={es}
            mode='single'
            selected={selectedDate}
            onSelect={(d) => setSelectedDate(d as Date)}
            className='rounded-lg border border-border text-xs '
          />

          <EmployeesSelectorCollapsible
            employees={employees}
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            isEmployeesOpen={isEmployeesOpen}
            setIsEmployeesOpen={setIsEmployeesOpen}
          />

          <ServicesSelectorCollapsible
            services={services}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            isOpen={isServicesOpen}
            setIsOpen={setIsServicesOpen}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function EmployeesSelectorCollapsible({
  isEmployeesOpen,
  setIsEmployeesOpen,
  employees,
  selectedEmployees,
  setSelectedEmployees,
}) {
  return (
    <Collapsible open={isEmployeesOpen} onOpenChange={setIsEmployeesOpen}>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium'>Empleados</h3>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm'>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isEmployeesOpen ? '' : 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='space-y-2 mt-2'>
        {employees.map((employee: Employee) => (
          <div key={employee.id} className='flex items-center'>
            <Checkbox
              checked={selectedEmployees.has(employee.id)}
              onCheckedChange={(checked) => {
                const newSelected = new Set(selectedEmployees)
                if (checked) newSelected.add(employee.id)
                else newSelected.delete(employee.id)
                setSelectedEmployees(newSelected)
              }}
            />
            <div
              className='w-3 h-3 rounded-full ml-2'
              style={{ backgroundColor: employee.color }}
            />
            <span className='ml-2 text-sm'>{employee.name}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ServicesSelectorCollapsible({
  isOpen,
  setIsOpen,
  services,
  selectedServices,
  setSelectedServices,
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium'>Servicios</h3>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm'>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen ? '' : 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='space-y-2 mt-2'>
        {services.map((service: Service) => (
          <div key={service.id} className='flex items-center'>
            <Checkbox
              checked={selectedServices.has(service.id)}
              onCheckedChange={(checked) => {
                const newSelected = new Set(selectedServices)
                if (checked) newSelected.add(service.id)
                else newSelected.delete(service.id)
                setSelectedServices(newSelected)
              }}
            />
            <span className='ml-2 text-sm'>{service.name}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

import { FC, useState } from 'react'
import { es } from 'date-fns/locale/es'
import { ChevronDown, MenuIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import type { Employee, Service } from './types'
import { useSidebar } from '@/components/ui/sidebar.tsx'

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
  const {open: mainSidebarOpen} = useSidebar()

  return (
    <div className='relative h-screen '>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          'bg-background border-r shadow-lg transition-all duration-500 ease-in-out transform h-full',
          isOpen ? 'w-80 translate-x-0' : 'w-20 translate-x-0'
        )}
      >
        <ScrollArea className='h-full'>
          <div className={mainSidebarOpen ? "px-4" : "pr-4" } >
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='w-full mb-6 hover:bg-secondary/80 transition-all duration-300'
              >
                <MenuIcon
                  className={cn(
                    'h-5 w-5 transition-transform duration-500',
                    isOpen ? 'rotate-0' : 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className='space-y-6 transition-all duration-500'>
              <Button
                className='w-full bg-primary hover:bg-primary/90 transition-all duration-300'
                onClick={onCreateEvent}
              >
                <Plus className='mr-2 h-4 w-4 animate-pulse' /> Agendar
              </Button>

              <div className='relative rounded-xl border w-full grid place-items-center transition-all duration-300 hover:shadow-lg'>
                <Calendar
                  locale={es}
                  mode='single'
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d as Date)}
                  className='text-sm w-full items-center '
                />
              </div>

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
              <br />
            </CollapsibleContent>
          </div>
        </ScrollArea>
      </Collapsible>
    </div>
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
          <div
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
            <div
              className='w-3 h-3 rounded-full ml-3 transition-transform duration-300 group-hover:scale-125'
              style={{ backgroundColor: employee.color }}
            />
            <label
              htmlFor={'check-' + employee.id}
              className='cursor-pointer ml-3 text-sm font-medium text-primary/80 transition-colors duration-300 group-hover:text-primary'
            >
              {employee.name}
            </label>
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='rounded-lg border p-4 transition-all duration-300 hover:shadow-lg'
    >
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-primary/90'>Servicios</h3>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm'>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isOpen ? 'rotate-0' : '-rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className='mt-2'>
        {services.map((service: Service) => (
          <div
            key={service.id}
            className='flex items-center group p-2 rounded-md transition-all duration-300 hover:bg-secondary/40 cursor-pointer'
          >
            <div className='transform transition-all duration-300 group-hover:scale-110'>
              <Checkbox
                id={'check-service' + service.id}
                checked={selectedServices.has(service.id)}
                onCheckedChange={(checked) => {
                  const newSelected = new Set(selectedServices)
                  if (checked) newSelected.add(service.id)
                  else newSelected.delete(service.id)
                  setSelectedServices(newSelected)
                }}
              />
            </div>
            <label
              htmlFor={'check-service' + service.id}
              className='cursor-pointer ml-3 text-sm font-medium text-primary/80 transition-colors duration-300 group-hover:text-primary'
            >
              {service.name}
            </label>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

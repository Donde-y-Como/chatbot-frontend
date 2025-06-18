import { useState } from 'react'
import { es } from 'date-fns/locale/es'
import { MenuIcon, Plus, ChevronDown, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useSidebar } from '@/components/ui/sidebar.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { EmployeesSelector } from '@/features/appointments/EmployeesSelector.tsx'
import { MakeAppointmentDialog } from '@/features/appointments/components/MakeAppointmentDialog.tsx'
import { QuickAppointmentDialog } from '@/features/appointments/components/QuickAppointmentDialog.tsx'
import { Employee } from '../employees/types'

interface SidebarProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  employees?: Employee[]
  selectedEmployees: Set<string>
  setSelectedEmployees: (employees: Set<string>) => void
}

export function CalendarSidebar({
  selectedDate,
  setSelectedDate,
  employees,
  selectedEmployees,
  setSelectedEmployees,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(true)
  const [showCompleteAppointment, setShowCompleteAppointment] = useState(false)
  const [showQuickAppointment, setShowQuickAppointment] = useState(false)
  const { open: mainSidebarOpen } = useSidebar()

  // Handlers for dropdown options
  const handleQuickAppointment = () => {
    setShowQuickAppointment(true)
  }

  const handleCompleteAppointment = () => {
    setShowCompleteAppointment(true)
  }

  if (!employees) return <CalendarSidebarSkeleton />

  return (
    <div className='relative h-screen w-fit'>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className='bg-background pr-2 py-2 border-r h-full'
      >
        <div className={mainSidebarOpen ? 'pl-2' : ''}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='w-full mb-6 hover:bg-secondary/80 transition-all duration-300'
            >
              <MenuIcon className='h-5 w-5 transition-transform duration-500' />
            </Button>
          </CollapsibleTrigger>

          <ScrollArea className='h-screen pr-3'>
            <CollapsibleContent className='mb-10 h-full space-y-6 flex flex-col'>
              <div className='w-full hidden sm:block'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className='w-full bg-primary hover:bg-primary/90 transition-all duration-300'>
                      <Plus className='mr-2 h-4 w-4' />
                      Agendar Cita
                      <ChevronDown className='ml-2 h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem onClick={handleQuickAppointment} className="p-3">
                      <Zap className="mr-3 h-5 w-5 text-blue-500" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Cita rápida</span>
                        <span className="text-xs text-muted-foreground">Solo campos esenciales: cliente, servicios, fecha y horario</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleCompleteAppointment} className="p-3">
                      <Settings className="mr-3 h-5 w-5 text-green-500" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Cita completa</span>
                        <span className="text-xs text-muted-foreground">Todos los campos: empleados, notas, estado, pago y más</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='relative rounded-xl border w-full grid place-items-center  hover:shadow-lg'>
                <Calendar
                  required
                  locale={es}
                  mode='single'
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d as Date)}
                />
              </div>
              <EmployeesSelector
                employees={employees}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
                isEmployeesOpen={isEmployeesOpen}
                setIsEmployeesOpen={setIsEmployeesOpen}
              />
              <br />
              <br />
              <br />
            </CollapsibleContent>
          </ScrollArea>
        </div>
      </Collapsible>
      
      {/* Diálogos */}
      <MakeAppointmentDialog
        defaultOpen={showCompleteAppointment}
        onOpenChange={setShowCompleteAppointment}
      />
      
      <QuickAppointmentDialog
        open={showQuickAppointment}
        onOpenChange={setShowQuickAppointment}
      />
    </div>
  )
}

export function CalendarSidebarSkeleton() {
  return (
    <div className='relative h-screen'>
      <Collapsible
        open={true}
        className='bg-background border-r shadow-lg transition-all duration-500 ease-in-out transform h-full'
      >
        <div className='px-4'>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='w-full mb-6 hover:bg-secondary/80 transition-all duration-300'
            >
              <MenuIcon className='h-5 w-5 transition-transform duration-500' />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className='space-y-6 transition-all duration-500'>
            <Skeleton className='h-10 w-full' />

            <div className='relative rounded-xl border w-full p-4'>
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <Skeleton className='h-6 w-32' />
                  <Skeleton className='h-6 w-32' />
                </div>
                <div className='grid grid-cols-7 gap-2'>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className='h-8 w-8' />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, week) => (
                  <div key={week} className='grid grid-cols-7 gap-2'>
                    {Array.from({ length: 7 }).map((_, day) => (
                      <Skeleton key={`${week}-${day}`} className='h-8 w-8' />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-4'>
              <Skeleton className='h-8 w-full' />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <Skeleton className='h-6 w-40' />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

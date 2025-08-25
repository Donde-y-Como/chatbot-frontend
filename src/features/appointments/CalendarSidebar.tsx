import { useState, useCallback } from 'react'
import { es } from 'date-fns/locale/es'
import { MenuIcon, Plus, ChevronDown, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
// Removed Collapsible imports - no longer needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
// Removed unused useSidebar import
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
  isOpen?: boolean
  onToggle?: () => void
}

export function CalendarSidebar({
  selectedDate,
  setSelectedDate,
  employees,
  selectedEmployees,
  setSelectedEmployees,
  isOpen = true,
  onToggle,
}: SidebarProps) {
   const [internalIsOpen, setInternalIsOpen] = useState(true)
  const sidebarIsOpen = onToggle ? isOpen : internalIsOpen
  
  const toggleSidebar = useCallback(() => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(prev => !prev)
    }
  }, [onToggle])
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(true)
  const [showCompleteAppointment, setShowCompleteAppointment] = useState(false)
  const [showQuickAppointment, setShowQuickAppointment] = useState(false)

  // Handlers for dropdown options
  const handleQuickAppointment = () => {
    setShowQuickAppointment(true)
  }

  const handleCompleteAppointment = () => {
    setShowCompleteAppointment(true)
  }

  if (!employees) return <CalendarSidebarSkeleton />

  return (
    <>
      {/* Sidebar Panel */}
      <div
        className={`${
          sidebarIsOpen 
            ? 'fixed md:relative z-40 md:z-auto left-0 top-0 h-full max-w-xs md:max-w-none md:w-72 bg-background md:bg-card/50 shadow-lg md:shadow-none' 
            : 'hidden'
        }`}
      >
        {/* Mobile Backdrop */}
        {sidebarIsOpen && (
          <div 
            className='fixed inset-0 bg-black/50 md:hidden z-30'
            onClick={toggleSidebar}
          />
        )}

        {sidebarIsOpen && (
          <div className='relative z-40 h-full flex flex-col bg-background md:bg-transparent px-2 md:px-0'>
            {/* Sidebar Header */}

            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='flex-1 overflow-hidden'>
                <ScrollArea className='h-full'>
                  <div className='p-2 md:p-3 flex flex-col justify-center gap-8'>
                    {/* Quick Actions */}
                    <div className='space-y-2 md:space-y-3'>
                      <h3 className='text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider'>Acciones rápidas</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className='w-full h-9 md:h-10 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-300'>
                            <Plus className='mr-2 h-3 w-3 md:h-4 md:w-4' />
                            Crear cita
                            <ChevronDown className='ml-auto h-3 w-3 md:h-4 md:w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72 p-2">
                          <DropdownMenuItem 
                            onClick={handleQuickAppointment} 
                            className="p-4 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className='flex items-start gap-3'>
                              <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0'>
                                <Zap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm">Creación rápida</span>
                                <span className="text-xs text-muted-foreground leading-relaxed">
                                  Solo campos esenciales: cliente, servicios, fecha y horario
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className='my-2' />
                          
                          <DropdownMenuItem 
                            onClick={handleCompleteAppointment} 
                            className="p-4 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className='flex items-start gap-3'>
                              <div className='w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0'>
                                <Settings className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm">Creación detallada</span>
                                <span className="text-xs text-muted-foreground leading-relaxed">
                                  Todos los campos: empleados, notas, estado, pago y más
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Calendar Section */}
                    <div className='space-y-2 md:space-y-3 p-2'>
                      <h3 className='text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider  '>Calendario</h3>
                      <div className='rounded-lg md:rounded-xl bg-card overflow-hidden transition-all duration-300 '>
                        <Calendar
                          required
                          locale={es}
                          mode='single'
                          selected={selectedDate}
                          onSelect={(d) => setSelectedDate(d)}
                          className='text-sm w-full'
                        />
                      </div>
                    </div>

                    {/* Employees Filter Section */}
                    <div className=' '>
                       <EmployeesSelector
                        employees={employees}
                        selectedEmployees={selectedEmployees}
                        setSelectedEmployees={setSelectedEmployees}
                        isEmployeesOpen={isEmployeesOpen}
                        setIsEmployeesOpen={setIsEmployeesOpen}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Diálogos */}
      <MakeAppointmentDialog
        defaultOpen={showCompleteAppointment}
        onOpenChange={setShowCompleteAppointment}
      />
      
      <QuickAppointmentDialog
        open={showQuickAppointment}
        onOpenChange={setShowQuickAppointment}
      />
    </>
  )
}

export function CalendarSidebarSkeleton() {
  return (
    <div className='fixed md:relative z-40 md:z-auto left-0 top-0 h-full w-full max-w-xs md:max-w-none md:w-56 lg:w-64 bg-background md:bg-card/50'>
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='p-2 md:p-3 bg-background md:bg-card/50 flex items-center justify-between md:justify-center'>
          <h2 className='text-sm font-medium md:hidden'>Cargando...</h2>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 md:w-full md:justify-center'
            disabled
          >
          </Button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
          <div className='p-2 md:p-3 space-y-3 md:space-y-4'>
            {/* Quick Actions */}
            <div className='space-y-2 md:space-y-3'>
              <Skeleton className='h-3 md:h-4 w-20 md:w-24' />
              <Skeleton className='h-9 md:h-10 w-full rounded-lg' />
            </div>

            {/* Calendar */}
            <div className='space-y-2 md:space-y-3'>
              <Skeleton className='h-3 md:h-4 w-16 md:w-20' />
              <div className='rounded-lg md:rounded-xl bg-card p-3 md:p-4'>
                <div className='space-y-3 md:space-y-4'>
                  <div className='flex justify-between items-center'>
                    <Skeleton className='h-4 md:h-5 w-20 md:w-24' />
                    <div className='flex gap-1'>
                      <Skeleton className='h-5 w-5 md:h-6 md:w-6' />
                      <Skeleton className='h-5 w-5 md:h-6 md:w-6' />
                    </div>
                  </div>
                  <div className='grid grid-cols-7 gap-1 md:gap-2'>
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className='h-6 md:h-8 w-full aspect-square' />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Employees */}
            <div className='space-y-2 md:space-y-3'>
              <Skeleton className='h-3 md:h-4 w-14 md:w-16' />
              <div className='rounded-lg md:rounded-xl bg-card'>
                <div className='p-3 md:p-4'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-3 md:h-4 w-16 md:w-20' />
                    <Skeleton className='h-5 w-5 md:h-6 md:w-6' />
                  </div>
                </div>
                <div className='px-2 pb-2 md:p-2 space-y-0.5 md:space-y-1'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='flex items-center gap-2 md:gap-3 p-2 md:p-3'>
                      <Skeleton className='h-3 w-3 md:h-4 md:w-4' />
                      <Skeleton className='h-2.5 w-2.5 md:h-3 md:w-3 rounded-full' />
                      <Skeleton className='h-3 md:h-4 w-20 md:w-24' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { es } from 'date-fns/locale/es'
import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSidebar } from '@/components/ui/sidebar.tsx'
import { EmployeesSelector } from '@/features/appointments/EmployeesSelector.tsx'
import { MakeAppointmentDialog } from '@/features/appointments/MakeAppointmentDialog.tsx'
import type { Employee } from './types'
import { Skeleton } from '@/components/ui/skeleton.tsx'

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
  const { open: mainSidebarOpen } = useSidebar()

  if(!employees) return <CalendarSidebarSkeleton />

  return (
    <div className='relative h-screen '>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className='bg-background border-r shadow-lg transition-all duration-500 ease-in-out transform h-full'
      >
        <div className={mainSidebarOpen ? 'px-4' : 'pr-4'}>
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
            <MakeAppointmentDialog />
            <div className='relative rounded-xl border w-full grid place-items-center transition-all duration-300 hover:shadow-lg'>
              <Calendar
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
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}


export function CalendarSidebarSkeleton() {
  return (
    <div className="relative h-screen">
      <Collapsible
        open={true}
        className="bg-background border-r shadow-lg transition-all duration-500 ease-in-out transform h-full"
      >
        <div className="px-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-6 hover:bg-secondary/80 transition-all duration-300"
            >
              <MenuIcon className="h-5 w-5 transition-transform duration-500" />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 transition-all duration-500">
            <Skeleton className="h-10 w-full" />

            <div className="relative rounded-xl border w-full p-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, week) => (
                  <div key={week} className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, day) => (
                      <Skeleton key={`${week}-${day}`} className="h-8 w-8" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
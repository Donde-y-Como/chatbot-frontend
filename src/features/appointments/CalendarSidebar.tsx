import type React from "react"
import { format, addMonths, startOfWeek, addDays, isSameMonth, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Employee } from "./types"

interface SidebarProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  employees: Employee[]
  selectedEmployees: Set<string>
  setSelectedEmployees: (employees: Set<string>) => void
  onCreateEvent: () => void
}

export const CalendarSidebar: React.FC<SidebarProps> = ({
                                                  currentMonth,
                                                  setCurrentMonth,
                                                  selectedDate,
                                                  setSelectedDate,
                                                  employees,
                                                  selectedEmployees,
                                                  setSelectedEmployees,
                                                  onCreateEvent,
                                                }) => {
  return (
    <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
      <Button className="w-full mb-4" onClick={onCreateEvent}>
        <Plus className="mr-2" /> Create Event
      </Button>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">{format(currentMonth, "MMMM yyyy")}</span>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="font-medium">
              {day}
            </div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const date = addDays(startOfWeek(currentMonth), i)
            return (
              <Button
                key={date.toISOString()}
                variant={isSameDay(date, selectedDate) ? "default" : "ghost"}
                className={`h-8 w-8 p-0 ${!isSameMonth(date, currentMonth) ? "text-gray-400" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                {format(date, "d")}
              </Button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Employees</h3>
        {employees.map((employee) => (
          <div key={employee.id} className="flex items-center mb-2">
            <Checkbox
              checked={selectedEmployees.has(employee.id)}
              onCheckedChange={(checked) => {
                const newSelected = new Set(selectedEmployees)
                if (checked) newSelected.add(employee.id)
                else newSelected.delete(employee.id)
                setSelectedEmployees(newSelected)
              }}
            />
            <div className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: employee.color }} />
            <span className="ml-2">{employee.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


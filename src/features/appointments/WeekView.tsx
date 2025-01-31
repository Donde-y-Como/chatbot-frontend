import type React from "react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { DayColumn } from "./DayColumn"
import type { Employee, Event } from "./types"

interface WeekViewProps {
  selectedDate: Date
  events: Event[]
  employees: Employee[]
  onEventClick: (event: Event) => void
  onTimeSlotClick: (time: Date) => void
}

export const WeekView: React.FC<WeekViewProps> = ({
                                                    selectedDate,
                                                    events,
                                                    employees,
                                                    onEventClick,
                                                    onTimeSlotClick,
                                                  }) => {
  const weekStart = startOfWeek(selectedDate)

  return (
    <div className="flex h-full">
      <div className="w-16 flex-shrink-0 border-r">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="h-[60px] border-b text-xs text-right pr-2">
            {format(new Date().setHours(i, 0, 0, 0), "h a")}
          </div>
        ))}
      </div>
      <div className="flex-1 flex">
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i)
          return (
            <DayColumn
              key={i}
              date={day}
              events={events.filter((event) => isSameDay(event.start, day))}
              employees={employees}
              onEventClick={onEventClick}
              onTimeSlotClick={onTimeSlotClick}
              isToday={isSameDay(day, new Date())}
            />
          )
        })}
      </div>
    </div>
  )
}


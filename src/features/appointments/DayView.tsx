import type React from "react"
import { DayColumn } from "./DayColumn"
import type { Employee, Event } from "./types"

interface DayViewProps {
  selectedDate: Date
  events: Event[]
  employees: Employee[]
  onEventClick: (event: Event) => void
  onTimeSlotClick: (time: Date) => void
}

export const DayView: React.FC<DayViewProps> = ({ selectedDate, events, employees, onEventClick, onTimeSlotClick }) => {
  return (
    <div className="flex h-full">
      <div className="w-16 flex-shrink-0 border-r">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="h-[60px] border-b text-xs text-right pr-2">
            {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
          </div>
        ))}
      </div>
      <div className="flex-1">
        <DayColumn
          date={selectedDate}
          events={events}
          employees={employees}
          onEventClick={onEventClick}
          onTimeSlotClick={onTimeSlotClick}
          isToday={true}
        />
      </div>
    </div>
  )
}


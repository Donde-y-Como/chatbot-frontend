import type React from "react"
import { format, setHours, setMinutes } from "date-fns"
import { useDroppable } from "@dnd-kit/core"
import type { Employee, Event } from "./types"
import { DraggableEvent } from "./DraggableEvent"

interface DayColumnProps {
  date: Date
  events: Event[]
  employees: Employee[]
  onEventClick: (event: Event) => void
  onTimeSlotClick: (time: Date) => void
  isToday: boolean
}

export const DayColumn: React.FC<DayColumnProps> = ({
                                                      date,
                                                      events,
                                                      employees,
                                                      onEventClick,
                                                      onTimeSlotClick,
                                                      isToday,
                                                    }) => {
  const { setNodeRef } = useDroppable({
    id: date.toISOString(),
  })

  const getEventPosition = (event: Event) => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes()
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes()
    const top = (startMinutes / 1440) * 100
    const height = ((endMinutes - startMinutes) / 1440) * 100
    return { top, height }
  }

  return (
    <div ref={setNodeRef} className={`flex-1 relative border-r ${isToday ? "bg-blue-50" : ""}`}>
      <div className="sticky top-0 z-10 bg-white border-b p-2 text-center font-medium">{format(date, "EEE d")}</div>
      <div className="relative" style={{ height: "calc(24 * 60px)" }}>
        {Array.from({ length: 24 * 4 }, (_, i) => {
          const slotTime = setMinutes(setHours(date, Math.floor(i / 4)), (i % 4) * 15)
          return (
            <div
              key={i}
              className="absolute w-full border-b border-gray-100"
              style={{ top: `${(i / (24 * 4)) * 100}%`, height: "15px" }}
              onClick={() => onTimeSlotClick(slotTime)}
            />
          )
        })}
        {events.map((event) => {
          const { top, height } = getEventPosition(event)
          const employee = employees.find((emp) => emp.id === event.employeeId)
          return (
            <DraggableEvent
              key={event.id}
              event={event}
              style={{
                top: `${top}%`,
                height: `${height}%`,
                backgroundColor: employee?.color || "gray",
              }}
              onClick={() => onEventClick(event)}
            />
          )
        })}
        {isToday && (
          <div
            className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
            style={{
              top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  )
}


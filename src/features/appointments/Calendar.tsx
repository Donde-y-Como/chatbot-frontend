import { useState, useMemo } from 'react'
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import type { Event } from './types'
import { generateMockEvents, mockEmployees } from '@/features/appointments/mockData.ts'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { addMinutes } from 'date-fns'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { WeekView } from '@/features/appointments/WeekView.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import { EventDialog } from '@/features/appointments/EventDialog.tsx'

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week">("week")
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set(mockEmployees.map((emp) => emp.id))
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Partial<Event>>({})

  const { events, handleDragEnd, updateEvent, createEvent, deleteEvent } = useCalendarEvents(generateMockEvents())
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

  const filteredEvents = useMemo(() => {
    return events.filter((event) => selectedEmployees.has(event.employeeId))
  }, [events, selectedEmployees])

  const handleTimeSlotClick = (time: Date) => {
    setSelectedEvent({
      employeeId: mockEmployees[0].id,
      start: time,
      end: addMinutes(time, 60),
      status: "scheduled",
    })
    setIsCreateEventOpen(true)
  }

  const handleCreateEvent = () => {
    setSelectedEvent({
      employeeId: mockEmployees[0].id,
      start: new Date(),
      end: addMinutes(new Date(), 60),
      status: "scheduled",
    })
    setIsCreateEventOpen(true)
  }

  return (
    <div className="h-screen w-full flex bg-white">
      <CalendarSidebar
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        employees={mockEmployees}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        onCreateEvent={handleCreateEvent}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          view={view}
          setView={setView}
        />

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto">
            {view === "week" ? (
              <WeekView
                selectedDate={selectedDate}
                events={filteredEvents}
                employees={mockEmployees}
                onEventClick={setSelectedEvent}
                onTimeSlotClick={handleTimeSlotClick}
              />
            ) : (
              <DayView
                selectedDate={selectedDate}
                events={filteredEvents}
                employees={mockEmployees}
                onEventClick={setSelectedEvent}
                onTimeSlotClick={handleTimeSlotClick}
              />
            )}
          </div>
        </DndContext>
      </div>

      <EventDialog
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        event={selectedEvent}
        onUpdate={updateEvent}
        onCreate={createEvent}
        onDelete={deleteEvent}
        employees={mockEmployees}
      />
    </div>
  )
}
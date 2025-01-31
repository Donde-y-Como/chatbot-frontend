import type React from "react"
import { format, addDays, addWeeks } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarHeaderProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  view: "day" | "week"
  setView: (view: "day" | "week") => void
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ selectedDate, setSelectedDate, view, setView }) => {
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setSelectedDate(new Date())}>
          Today
        </Button>
        <Button
          variant="ghost"
          onClick={() => setSelectedDate(view === "day" ? addDays(selectedDate, -1) : addWeeks(selectedDate, -1))}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setSelectedDate(view === "day" ? addDays(selectedDate, 1) : addWeeks(selectedDate, 1))}
        >
          <ChevronRight />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(selectedDate, view === "day" ? "MMMM d, yyyy" : "'Week of' MMMM d, yyyy")}
        </h2>
      </div>
      <div className="flex gap-2">
        <Button variant={view === "day" ? "default" : "ghost"} onClick={() => setView("day")}>
          Day
        </Button>
        <Button variant={view === "week" ? "default" : "ghost"} onClick={() => setView("week")}>
          Week
        </Button>
      </div>
    </div>
  )
}


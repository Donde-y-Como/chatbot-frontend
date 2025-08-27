
interface TimeSlotsProps {
  startAt?: number
  endAt?: number
  timeSlotHeight?: number
}

export function TimeSlots({ startAt = 400, endAt = 1400, timeSlotHeight = 120 }: TimeSlotsProps) {
  const startHour = Math.floor(startAt / 60)
  const endHour = Math.ceil(endAt / 60)
  // Create an array of hours from startHour to endHour.
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  return (
    <div className='relative'> {/* Ensure the container is relative */}
      {hours.map((hour) => (
        <div 
          key={hour} 
          className='border-b text-xs text-right pr-2 py-[4px]'
          style={{ height: `${timeSlotHeight}px` }}
        >
          {formatHour(hour)}
        </div>
      ))}
    </div>
  )
}
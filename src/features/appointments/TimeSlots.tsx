import React from 'react'

export function TimeSlots({ startAt = 540, endAt = 1080 }) {
  const startHour = Math.floor(startAt / 60)
  const endHour = Math.ceil(endAt / 60)
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  )

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  return (
    <div className='flex flex-col'>
      {hours.map((hour) => (
        <div key={hour} className='h-16 border-b text-xs text-right pr-2'>
          {formatHour(hour)}
        </div>
      ))}
    </div>
  )
}
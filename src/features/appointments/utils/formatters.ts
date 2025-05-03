/**
 * Utility functions for formatting time and dates in the appointments feature
 */

/**
 * Formats minutes into a 12-hour time format (e.g., "2:30 PM")
 * @param minutes - Total minutes (e.g., 150 for 2:30)
 * @returns Formatted time string
 */
export function formatSlotHour(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  // Determine period (AM/PM)
  const period = hours < 12 ? 'AM' : 'PM'

  // Convert to 12-hour format
  const displayHours =
    hours === 0
      ? 12 // Midnight
      : hours > 12
        ? hours - 12 // PM
        : hours // AM

  // Format minutes with leading zero if needed
  const displayMinutes = mins.toString().padStart(2, '0')

  // Return formatted time
  return `${displayHours}:${displayMinutes} ${period}`
}

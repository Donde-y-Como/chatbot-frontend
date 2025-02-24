export const timeStringToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

export const minutesToTimeString = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const formattedHours = String(hours).padStart(2, "0")
    const formattedMins = String(mins).padStart(2, "0")
    return `${formattedHours}:${formattedMins}`
}

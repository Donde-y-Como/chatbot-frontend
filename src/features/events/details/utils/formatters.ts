import moment from "moment-timezone"
import { RecurrencePrimitives } from "../../types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function formatEventDuration(start: string, end: string) {
    const duration = moment.duration(
        moment
            .tz(end, 'America/Mexico_City')
            .diff(moment.tz(start, 'America/Mexico_City'))
    )
    const days = duration.days()
    const hours = duration.hours()
    const minutes = duration.minutes()

    return `${days > 0 ? `${days} día${days !== 1 ? 's' : ''}` : ''}${hours > 0 ? `${days > 0 ? ', ' : ''}${hours} hora${hours !== 1 ? 's' : ''}` : ''}${minutes > 0 ? `${days > 0 || hours > 0 ? ', ' : ''}${minutes} minuto${minutes !== 1 ? 's' : ''}` : ''}`
}

export function formatDateRange(start: string, end: string) {
    return `${format(moment.tz(start, 'America/Mexico_City').toDate(), 'PP', { locale: es })} ${format(moment.tz(start, 'America/Mexico_City').toDate(), 'p', { locale: es })} - ${format(moment.tz(end, 'America/Mexico_City').toDate(), 'PP p', { locale: es })}`
}

export function formatPrice(amount: number, currency: string) {
    return `${amount} ${currency}`
}

export function formatRecurrence(recurrence: RecurrencePrimitives | null) {
    if (!recurrence) {
        return 'No se repite'
    }
    if (recurrence.frequency === 'daily') {
        return `Diario`
    }
    if (recurrence.frequency === 'weekly') {
        return `Semanalmente`
    }
    if (recurrence.frequency === 'monthly') {
        return `Mensualmente`
    }
    if (recurrence.frequency === 'yearly') {
        return `Anualmente`
    }
    return 'No se repite'
}
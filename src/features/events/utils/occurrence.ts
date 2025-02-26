import { addDays, addMonths, addWeeks, addYears, format, startOfDay } from "date-fns";
import { DurationPrimitives, EndCondition, EventPrimitives, Frequency } from "../types";

export function translateRecurrente(frequency: string) {
    return frequency === 'weekly'
        ? 'semanalmente'
        : frequency === 'daily'
            ? 'diariamente'
            : frequency === 'monthly'
                ? 'mensualmente'
                : 'anualmente'
}

export function getRecurrenceText(event: EventPrimitives) {
    if (event.recurrence.frequency === 'never') return null

    let text = `Se repite ${translateRecurrente(event.recurrence.frequency)}`

    if (event.recurrence.endCondition) {
        if (event.recurrence.endCondition.type === 'occurrences') {
            text += `, ${event.recurrence.endCondition.occurrences} veces`
        } else if (event.recurrence.endCondition.type === 'date') {
            text += `, hasta ${format(event.recurrence.endCondition.until, 'MMM d, yyyy')}`
        }
    }

    return text
}


export function generateOccurrences(baseDuration: DurationPrimitives, frequency: Frequency, endCondition?: EndCondition): DurationPrimitives[] {
    if (frequency === 'never') {
        return [baseDuration];
    }

    const occurrences: DurationPrimitives[] = [];
    let currentStart = new Date(baseDuration.startAt);
    let currentEnd = new Date(baseDuration.endAt);

    while (shouldContinueGenerating(occurrences.length, currentStart, frequency, endCondition)) {
        occurrences.push({ startAt: currentStart.toISOString(), endAt: currentEnd.toISOString() });

        const nextDates = calculateNextDates(currentStart, currentEnd, frequency);
        currentStart = nextDates.start;
        currentEnd = nextDates.end;
    }

    return occurrences;
}

export function calculateNextDates(currentStart: Date, currentEnd: Date, frequency: Frequency) {
    const difference = currentEnd.getTime() - currentStart.getTime();

    let nextStart: Date;
    switch (frequency) {
        case 'daily':
            nextStart = addDays(currentStart, 1);
            break;
        case 'weekly':
            nextStart = addWeeks(currentStart, 1);
            break;
        case 'monthly':
            nextStart = addMonths(currentStart, 1);
            break;
        case 'yearly':
            nextStart = addYears(currentStart, 1);
            break;
        case 'never':
            return { start: currentStart, end: currentEnd };
    }

    const nextEnd = new Date(nextStart.getTime() + difference);
    return { start: nextStart, end: nextEnd };
}

export function shouldContinueGenerating(currentCount: number, currentDate: Date, frequency: Frequency, endCondition?: EndCondition): boolean {
    if (frequency === 'never') {
        return false;
    }

    if (endCondition?.type === 'occurrences') {
        return currentCount < endCondition.occurrences;
    }

    return startOfDay(currentDate) <= startOfDay(endCondition?.until ?? new Date());
}
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { appointmentService } from '@/features/appointments/appointmentService.ts';
import type { Schedule, MinutesTimeRange } from '@/features/appointments/types.ts';

export function useGetWorkSchedule(date: Date) {
  const queryResult = useQuery<Schedule>({
    queryKey: ['weekly-schedule'],
    queryFn: appointmentService.getSchedule,
    staleTime: Infinity,
    retry: 2,
  });

  const workHours = useMemo(() => {
    if (!queryResult.data) return undefined;
    return getDailyWorkHours(date, queryResult.data.weeklyWorkDays);
  }, [date, queryResult.data]);

  return {
    ...queryResult,
    workHours,
  };
}

export function getDailyWorkHours(
  date: Date,
  weeklyWorkDays: Schedule['weeklyWorkDays']
): MinutesTimeRange | undefined {
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayName = daysOfWeek[date.getDay()];
  return weeklyWorkDays[dayName];
}
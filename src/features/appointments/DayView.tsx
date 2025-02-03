import React, { useEffect, useState } from 'react';
import { EventBlock } from '@/features/appointments/EventBlock.tsx';
import { ServiceFilter, ServiceFilterProps } from '@/features/appointments/ServiceFilter.tsx';
import { TimeSlots } from '@/features/appointments/TimeSlots.tsx';
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts';
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts';
import { usePositionedEvents } from '@/features/appointments/hooks/usePositionedEvents.ts';
import type { Event } from './types';
import {  useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts'
import { Skeleton } from '@/components/ui/skeleton'; // Add your skeleton component

export function DayView({ events, date }: { events: Event[],date:Date }) {
  const { data: workHours, isLoading: isWorkHoursLoading } = useGetWorkSchedule(date);
  const { data: employees = [], isLoading: isEmployeesLoading } = useGetEmployees();
  const { data: services = [], isLoading: isServicesLoading } = useGetServices();

  const [selectedService, setSelectedService] =
    useState<ServiceFilterProps['selectedService']>('all');
  const [currentTime, setCurrentTime] = useState(date);

  const handleSelectedService = (serviceId: string | 'all') => {
    setSelectedService(serviceId)
  }

  const positionedEvents = usePositionedEvents({ events, selectedService });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(date);
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  const getCurrentTimePosition = () => {
    if (!workHours) return -100; // Position off-screen

    const startMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutesRelative = startMinutes - workHours.startAt;
    return (startMinutesRelative * 64) / 60;
  };

  const isLoading = isWorkHoursLoading || isEmployeesLoading || isServicesLoading;

  if (isLoading) {
    return (
      <div className='flex flex-col space-y-2 h-full'>
        <Skeleton className="h-10 w-full" />
        <div className='flex relative'>
          <Skeleton className="w-16 h-screen" />
          <Skeleton className="flex-1 h-screen" />
        </div>
      </div>
    );
  }

  if (!workHours) {
    return <div>No working hours available for this date</div>;
  }

  return (
    <div className='flex flex-col space-y-2 h-full'>
      <ServiceFilter
        services={services}
        selectedService={selectedService}
        onServiceSelect={handleSelectedService}
      />

      <div className='flex relative'>
        <div className='w-16 flex-shrink-0 border-r'>
          <TimeSlots startAt={workHours.startAt} endAt={workHours.endAt} />
        </div>

        {workHours && currentTime.getHours() * 60 < workHours.endAt && (
          <div
            className='absolute left-16 right-0 z-10 border-t-2 border-red-500'
            style={{ top: `${getCurrentTimePosition()}px` }}
          >
            <div className='absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500' />
          </div>
        )}

        <div
          className='flex-1 relative'
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent 63px,
              hsl(var(--border)) 63px,
              hsl(var(--border)) 64px
            )`,
            backgroundSize: '100% 64px',
          }}
        >
          {positionedEvents.map(({ event, column, totalColumns }) => {
            const employee = employees.find((emp) => emp.id === event.employeeId);
            if (!employee) return null;

            return (
              <EventBlock
                key={event.id}
                event={event}
                employee={employee}
                service={services.find((s) => s.id === event.serviceId)!}
                column={column}
                totalColumns={totalColumns}
                workHours={workHours}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
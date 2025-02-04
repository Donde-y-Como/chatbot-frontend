import React from 'react'
import { Badge } from '@/components/ui/badge.tsx'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area.tsx'
import type { Service } from '@/features/appointments/types.ts'

export interface ServiceFilterProps {
  services: Service[]
  selectedService: string | 'all'
  onServiceSelect: (serviceId: string | 'all') => void
}

export function ServiceFilter({
                                services,
                                selectedService,
                                onServiceSelect,
                              }: ServiceFilterProps) {
  return (
    <ScrollArea orientation="horizontal" className="w-full overflow-x-auto overflow-y-hidden min-h-fit whitespace-nowrap">
      <div className="flex space-x-2 p-4 ml-16">
        <Badge
          variant={selectedService === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onServiceSelect('all')}
        >
          Todos
        </Badge>
        {services.map((service) => (
          <Badge
            key={service.id}
            variant={selectedService === service.id ? 'default' : 'secondary'}
            className="cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => onServiceSelect(service.id)}
          >
            {service.name}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

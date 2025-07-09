import React from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

interface FilterButtonProps {
  isActive: boolean
  onClick: () => void
}

export function FilterButton({ isActive, onClick }: FilterButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      onClick={onClick}
      className={`h-10 sm:h-12 px-3 sm:px-4 ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-background hover:bg-accent'
      }`}
    >
      <Filter className="h-4 w-4 mr-2" />
      <span className="hidden xs:inline">Filtros</span>
      {isActive && (
        <div className="ml-2 w-2 h-2 bg-primary-foreground rounded-full" />
      )}
    </Button>
  )
}
import React from 'react'
import { Button } from '../../../components/ui/button'
import { POSCategory } from '../types'

interface CategoryTabsProps {
  activeCategory: POSCategory
  onCategoryChange: (category: POSCategory) => void
}

const categories: { value: POSCategory; label: string; disabled?: boolean }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PRODUCTOS', label: 'Productos' },
  { value: 'PAQUETES', label: 'Paquetes', disabled: true },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'EVENTOS', label: 'Eventos' }
]

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={activeCategory === category.value ? 'default' : 'outline'}
          onClick={() => !category.disabled && onCategoryChange(category.value)}
          disabled={category.disabled}
          className={`whitespace-nowrap px-6 py-2 h-10 ${
            activeCategory === category.value 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background hover:bg-accent'
          } ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {category.label}
          {category.disabled && (
            <span className="ml-2 text-xs opacity-60">(Próximamente)</span>
          )}
        </Button>
      ))}
    </div>
  )
}
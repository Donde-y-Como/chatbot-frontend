import React from 'react'
import { Button } from '@/components/ui/button.tsx'
import { POSCategory } from '../types'

interface CategoryTabsProps {
  activeCategory: POSCategory
  onCategoryChange: (category: POSCategory) => void
}

const categories: {
  value: POSCategory
  label: string
  shortLabel?: string
  disabled?: boolean
}[] = [
  { value: 'TODOS', label: 'Todos', shortLabel: 'Todo' },
  { value: 'PRODUCTOS', label: 'Productos', shortLabel: 'Prod.' },
  { value: 'PAQUETES', label: 'Paquetes', shortLabel: 'Paq.' },
  { value: 'SERVICIOS', label: 'Servicios', shortLabel: 'Serv.' },
  { value: 'EVENTOS', label: 'Eventos', shortLabel: 'Event.' },
]

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className='w-full'>
      {/* Tabs móviles - Grid compacto */}
      <div className='grid grid-cols-5 gap-1 sm:gap-2 lg:hidden'>
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={activeCategory === category.value ? 'default' : 'outline'}
            onClick={() =>
              !category.disabled && onCategoryChange(category.value)
            }
            disabled={category.disabled}
            size='sm'
            className={`
              h-8 px-1 text-xs whitespace-nowrap
              ${
                activeCategory === category.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent'
              } 
              ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className='block xs:hidden'>
              {/* Solo iconos en pantallas muy pequeñas */}
              {category.value === 'TODOS' && '📋'}
              {category.value === 'PRODUCTOS' && '📦'}
              {category.value === 'PAQUETES' && '🎁'}
              {category.value === 'SERVICIOS' && '🔧'}
              {category.value === 'EVENTOS' && '🎪'}
            </span>
            <span className='hidden xs:block sm:hidden'>
              {category.shortLabel}
            </span>
            <span className='hidden sm:block'>{category.label}</span>
            {category.disabled && (
              <span className='ml-1 text-xs opacity-60 hidden sm:inline'>
                (Próx.)
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Tabs desktop - Scroll horizontal */}
      <div className='hidden lg:flex gap-2 overflow-x-auto pb-2'>
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={activeCategory === category.value ? 'default' : 'outline'}
            onClick={() =>
              !category.disabled && onCategoryChange(category.value)
            }
            disabled={category.disabled}
            className={`whitespace-nowrap px-6 py-2 h-10 ${
              activeCategory === category.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            } ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {category.label}
            {category.disabled && (
              <span className='ml-2 text-xs opacity-60'>(Próximamente)</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}

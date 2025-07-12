import React from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { POSFilters } from '../types'
import { CategoryTabs } from './CategoryTabs'
import { FilterButton } from './FilterButton'
import { SearchBar } from './SearchBar'

interface StoreHeaderProps {
  filters: POSFilters
  filterStats: {
    isFiltered: boolean
    filtered: number
    total: number
  }
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
  onFilterButtonClick: () => void
  onSearchChange: (value: string) => void
  onCategoryChange: (category: POSFilters['category']) => void
}

export function StoreHeader({
  filters,
  filterStats,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onFilterButtonClick,
  onSearchChange,
  onCategoryChange,
}: StoreHeaderProps) {
  return (
    <div className='border-b border-border bg-card sticky top-0 z-20 lg:static'>
      {/* Header móvil */}
      <div className='lg:hidden'>
        <div className='flex items-center justify-between p-3'>
          <h1 className='text-lg font-semibold'>Orden</h1>
          <div className='flex items-center gap-2'>
            <FilterButton
              isActive={filters.isActive}
              onClick={onFilterButtonClick}
            />
            <Button
              variant='outline'
              size='sm'
              onClick={onToggleMobileMenu}
              className='h-8 w-8 p-0'
            >
              {isMobileMenuOpen ? (
                <X className='h-4 w-4' />
              ) : (
                <Menu className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda siempre visible en móvil */}
        <div className='px-3 pb-3'>
          <SearchBar
            value={filters.search}
            onChange={onSearchChange}
            placeholder='Buscar por nombre, SKU o código de barras...'
          />
        </div>

        {/* Menú desplegable móvil */}
        {isMobileMenuOpen && (
          <div className='border-t border-border bg-card/95 backdrop-blur-sm'>
            <div className='p-3'>
              <CategoryTabs
                activeCategory={filters.category}
                onCategoryChange={(category) => {
                  onCategoryChange(category)
                  onToggleMobileMenu()
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Header desktop */}
      <div className='hidden lg:block p-4'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex-1'>
            <SearchBar
              value={filters.search}
              onChange={onSearchChange}
              placeholder='Buscar por nombre, SKU o código de barras...'
            />
          </div>
          <FilterButton
            isActive={filters.isActive}
            onClick={onFilterButtonClick}
          />
        </div>

        <div className='flex items-center justify-between'>
          <CategoryTabs
            activeCategory={filters.category}
            onCategoryChange={onCategoryChange}
          />

          {/* Estadísticas de filtros */}
          {filterStats.isFiltered && (
            <div className='text-sm text-muted-foreground'>
              Mostrando {filterStats.filtered} de {filterStats.total} elementos
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

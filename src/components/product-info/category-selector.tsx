import * as React from 'react'
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Category } from '@/features/settings/categories/types'
import { useGetCategories, useCreateCategory } from '@/features/settings/categories/hooks/useCategories'
import { CategoryDialog } from '@/features/settings/categories/components/category-dialog'

interface CategorySelectorProps {
  selectedCategoryIds: string[]
  selectedSubcategoryIds: string[]
  onCategoryChange: (categoryIds: string[]) => void
  onSubcategoryChange: (subcategoryIds: string[]) => void
  className?: string
}

export function CategorySelector({
  selectedCategoryIds,
  selectedSubcategoryIds,
  onCategoryChange,
  onSubcategoryChange,
  className
}: CategorySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const { data: categories = [], isLoading: loading } = useGetCategories()
  const createCategoryMutation = useCreateCategory()

  // Las categorías ya vienen con subcategorías anidadas
  const parentCategories = categories

  // Obtener todas las subcategorías para la lógica de selección
  const allSubcategories = parentCategories.flatMap(cat => cat.subcategories || [])

  // Obtener categorías y subcategorías seleccionadas
  const selectedCategories = parentCategories.filter(cat => 
    selectedCategoryIds.includes(cat.id)
  )
  const selectedSubcategories = allSubcategories.filter(cat => 
    selectedSubcategoryIds.includes(cat.id)
  )

  // Manejar selección de categoría
  const handleCategorySelect = (categoryId: string) => {
    const newCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId]
    
    onCategoryChange(newCategoryIds)
    
    // Si se deselecciona una categoría, también deseleccionar sus subcategorías
    if (!newCategoryIds.includes(categoryId)) {
      const category = parentCategories.find(cat => cat.id === categoryId)
      const subcategoriesOfCategory = (category?.subcategories || []).map(sub => sub.id)
      
      const newSubcategoryIds = selectedSubcategoryIds.filter(id => 
        !subcategoriesOfCategory.includes(id)
      )
      onSubcategoryChange(newSubcategoryIds)
    }
  }

  // Manejar selección de subcategoría
  const handleSubcategorySelect = (subcategoryId: string) => {
    const subcategory = allSubcategories.find(sub => sub.id === subcategoryId)
    if (!subcategory) return

    const newSubcategoryIds = selectedSubcategoryIds.includes(subcategoryId)
      ? selectedSubcategoryIds.filter(id => id !== subcategoryId)
      : [...selectedSubcategoryIds, subcategoryId]
    
    onSubcategoryChange(newSubcategoryIds)
    
    // Si se selecciona una subcategoría, asegurar que su categoría padre esté seleccionada
    if (newSubcategoryIds.includes(subcategoryId) && 
        subcategory.parentCategoryId &&
        !selectedCategoryIds.includes(subcategory.parentCategoryId)) {
      onCategoryChange([...selectedCategoryIds, subcategory.parentCategoryId])
    }
  }

  // Remover categoría seleccionada
  const removeCategory = (categoryId: string) => {
    const newCategoryIds = selectedCategoryIds.filter(id => id !== categoryId)
    onCategoryChange(newCategoryIds)
    
    // También remover subcategorías de esta categoría
    const category = parentCategories.find(cat => cat.id === categoryId)
    const subcategoriesOfCategory = (category?.subcategories || []).map(sub => sub.id)
    
    const newSubcategoryIds = selectedSubcategoryIds.filter(id => 
      !subcategoriesOfCategory.includes(id)
    )
    onSubcategoryChange(newSubcategoryIds)
  }

  // Remover subcategoría seleccionada
  const removeSubcategory = (subcategoryId: string) => {
    onSubcategoryChange(selectedSubcategoryIds.filter(id => id !== subcategoryId))
  }

  // Filtrar subcategorías disponibles para mostrar
  const getAvailableSubcategories = (category: Category) => {
    return (category.subcategories || []).filter(sub => 
      searchValue === '' || 
      sub.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Categorías seleccionadas */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Categorías seleccionadas:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category.id} variant="secondary" className="gap-1">
                {category.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeCategory(category.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Subcategorías seleccionadas */}
      {selectedSubcategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Subcategorías seleccionadas:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSubcategories.map((subcategory) => (
              <Badge key={subcategory.id} variant="outline" className="gap-1">
                {subcategory.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeSubcategory(subcategory.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selector de categorías */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Seleccionar categorías...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar categorías..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    No se encontraron categorías
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreateDialogOpen(true)
                      setOpen(false)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nueva categoría
                  </Button>
                </div>
              </CommandEmpty>
              
              {/* Categorías padre */}
              {parentCategories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id)
                const availableSubcategories = getAvailableSubcategories(category)
                
                // Mostrar categoría si coincide con la búsqueda O si tiene subcategorías que coinciden
                const categoryMatches = searchValue === '' || 
                  category.name.toLowerCase().includes(searchValue.toLowerCase())
                const hasMatchingSubcategories = availableSubcategories.length > 0
                
                if (!categoryMatches && !hasMatchingSubcategories) {
                  return null
                }
                
                return (
                  <CommandGroup key={category.id} heading={category.name}>
                    {/* Solo mostrar la categoría padre si coincide con la búsqueda */}
                    {categoryMatches && (
                      <CommandItem
                        value={category.id}
                        onSelect={() => handleCategorySelect(category.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    )}
                    
                    {/* Subcategorías - con mejor indentación visual */}
                    {availableSubcategories.map((subcategory) => {
                      const isSubSelected = selectedSubcategoryIds.includes(subcategory.id)
                      
                      return (
                        <CommandItem
                          key={subcategory.id}
                          value={subcategory.id}
                          onSelect={() => handleSubcategorySelect(subcategory.id)}
                          className="cursor-pointer ml-6 pl-6 border-l-2 border-muted"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSubSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{subcategory.name}</div>
                            {subcategory.description && (
                              <div className="text-xs text-muted-foreground">
                                {subcategory.description}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )
              })}
              
              {/* Botón para crear nueva categoría */}
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setCreateDialogOpen(true)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear nueva categoría
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog para crear nueva categoría */}
      <CategoryDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async (values) => {
          await createCategoryMutation.mutateAsync(values)
        }}
        isSubmitting={createCategoryMutation.isPending}
        title="Crear nueva categoría"
        submitLabel="Crear categoría"
        mode="create"
      />
    </div>
  )
}

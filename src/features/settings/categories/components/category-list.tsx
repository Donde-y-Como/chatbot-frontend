import { useState } from 'react'
import { Category } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, Plus, ChevronRight, ChevronDown } from 'lucide-react'

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onView: (category: Category) => void
  onCreateSubcategory: (parentCategory: Category) => void
}

export function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  onView, 
  onCreateSubcategory 
}: CategoryListProps) {
  // Estado para controlar qué categorías están expandidas
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  if (categories.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No hay categorías registradas
      </div>
    )
  }

  // Separar categorías padre (las que no tienen parentCategoryId)
  const parentCategories = categories.filter(cat => !cat.parentCategoryId)

  return (
    <div className='space-y-4'>
      {parentCategories.map((parentCategory) => {
        const isExpanded = expandedCategories.has(parentCategory.id)
        const hasSubcategories = parentCategory.subcategories && parentCategory.subcategories.length > 0

        return (
          <div key={parentCategory.id} className='space-y-2'>
            {/* Categoría Padre */}
            <Card className='hover:shadow-md transition-shadow border-l-4 border-l-primary'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      {/* Botón para expandir/colapsar */}
                      {hasSubcategories && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={() => toggleExpanded(parentCategory.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronRight className='h-4 w-4' />
                          )}
                        </Button>
                      )}
                      {!hasSubcategories && <div className='w-6' />}
                      
                      <h3 className='font-semibold text-lg'>{parentCategory.name}</h3>
                      <Badge variant='default'>Categoría Padre</Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1 ml-8'>
                      {parentCategory.description}
                    </p>
                    {hasSubcategories && (
                      <div className='flex items-center gap-1 mt-2 ml-8 text-xs text-muted-foreground'>
                        <ChevronRight className='h-3 w-3' />
                        {parentCategory.subcategories.length} subcategoría(s)
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='flex gap-2 flex-wrap'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onView(parentCategory)}
                    className='flex-1 min-w-0'
                  >
                    <Eye className='h-4 w-4 mr-1' />
                    Ver
                  </Button>
                  <Button
                    variant='outline' 
                    size='sm'
                    onClick={() => onEdit(parentCategory)}
                    className='flex-1 min-w-0'
                  >
                    <Edit className='h-4 w-4 mr-1' />
                    Editar
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onCreateSubcategory(parentCategory)}
                    className='flex-1 min-w-0'
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Subcategoría
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onDelete(parentCategory)}
                    className='text-destructive hover:text-destructive'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subcategorías - Solo mostrar si está expandida */}
            {hasSubcategories && isExpanded && (
              <div className='ml-6 space-y-2 animate-in slide-in-from-top-2 duration-200'>
                {parentCategory.subcategories.map((subcategory) => (
                  <Card key={subcategory.id} className='hover:shadow-sm transition-shadow border-l-2 border-l-muted'>
                    <CardHeader className='pb-2'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <ChevronRight className='h-4 w-4 text-muted-foreground' />
                            <h4 className='font-medium'>{subcategory.name}</h4>
                            <Badge variant='secondary' className='text-xs'>Subcategoría</Badge>
                          </div>
                          <p className='text-sm text-muted-foreground mt-1 ml-6'>
                            {subcategory.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0 pl-6'>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onView(subcategory)}
                          className='flex-1'
                        >
                          <Eye className='h-4 w-4 mr-1' />
                          Ver
                        </Button>
                        <Button
                          variant='outline' 
                          size='sm'
                          onClick={() => onEdit(subcategory)}
                          className='flex-1'
                        >
                          <Edit className='h-4 w-4 mr-1' />
                          Editar
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onDelete(subcategory)}
                          className='text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

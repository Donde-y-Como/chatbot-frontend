import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Category } from '../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'

interface ViewCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  data?: Category
  allCategories?: Category[]
}

export function ViewCategoryDialog({ 
  isOpen, 
  onClose, 
  data, 
  allCategories = [] 
}: ViewCategoryDialogProps) {
  if (!data) return null

  const isParentCategory = !data.parentCategoryId
  const parentCategory = data.parentCategoryId 
    ? allCategories.find(cat => cat.id === data.parentCategoryId)
    : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            {data.name}
            <Badge variant={isParentCategory ? 'default' : 'secondary'}>
              {isParentCategory ? 'Categoría Padre' : 'Subcategoría'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detalles de la categoría
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-3'>

            <div>
              <span className='text-sm font-medium'>Descripción:</span>
              <p className='text-sm text-muted-foreground mt-1'>
                {data.description}
              </p>
            </div>

            {/* Mostrar categoría padre si es subcategoría */}
            {!isParentCategory && parentCategory && (
              <div>
                <span className='text-sm font-medium'>Categoría Padre:</span>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge variant='outline'>
                    {parentCategory.name}
                  </Badge>
                </div>
              </div>
            )}

            <Separator />

            {/* Mostrar subcategorías si es categoría padre */}
            {isParentCategory && data.subcategories && data.subcategories.length > 0 && (
              <div>
                <span className='text-sm font-medium'>
                  Subcategorías ({data.subcategories.length}):
                </span>
                <div className='mt-2 space-y-2'>
                  {data.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className='flex items-center gap-2 p-2 rounded border'>
                      <ChevronRight className='h-4 w-4 text-muted-foreground' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{subcategory.name}</p>
                        <p className='text-xs text-muted-foreground'>{subcategory.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar si no tiene subcategorías */}
            {isParentCategory && (!data.subcategories || data.subcategories.length === 0) && (
              <div>
                <span className='text-sm font-medium'>Subcategorías:</span>
                <p className='text-sm text-muted-foreground mt-1'>
                  Esta categoría no tiene subcategorías
                </p>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

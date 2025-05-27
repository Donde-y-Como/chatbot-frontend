import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Category } from '../types'

interface DeleteCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  category?: Category
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  category,
}: DeleteCategoryDialogProps) {
  if (!category) return null

  const isParentCategory = !category.parentCategoryId
  const hasSubcategories = category.subcategories && category.subcategories.length > 0
  const categoryType = isParentCategory ? 'categoría' : 'subcategoría'

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            ¿Eliminar {categoryType}?
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-3'>
            <p>
              ¿Estás seguro de que deseas eliminar la {categoryType}{' '}
              <strong>"{category.name}"</strong>?
            </p>

            <div className='flex items-center gap-2'>
              <Badge variant={isParentCategory ? 'default' : 'secondary'}>
                {isParentCategory ? 'Categoría Padre' : 'Subcategoría'}
              </Badge>
            </div>

            {/* Advertencia para categorías padre con subcategorías */}
            {isParentCategory && hasSubcategories && (
              <div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3'>
                <p className='text-sm text-amber-800 dark:text-amber-200 font-medium'>
                  ⚠️ Advertencia
                </p>
                <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
                  Esta categoría tiene {category.subcategories?.length} subcategoría(s). 
                  Al eliminarla, también se eliminarán todas sus subcategorías.
                </p>
              </div>
            )}

            {/* Advertencia general */}
            <p className='text-sm text-muted-foreground'>
              Esta acción no se puede deshacer. La {categoryType} será eliminada 
              permanentemente del sistema junto con cualquier asociación a productos.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Eliminar {categoryType}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

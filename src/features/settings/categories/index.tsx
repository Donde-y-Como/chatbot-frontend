import { useState, useMemo } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@uidotdev/usehooks'
import ContentSection from '../components/content-section'
import { CategoryList } from './components/category-list'
import { CategoryDialog } from './components/category-dialog'
import { ViewCategoryDialog } from './components/view-category-dialog'
import { DeleteCategoryDialog } from './components/delete-category-dialog'
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks/useCategories'
import { Category, CategoryFormValues } from './types'

export default function CategoriesSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreateSubcategoryDialogOpen, setIsCreateSubcategoryDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined)
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce de la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const {
    data: categories,
    isPending: isLoadingCategories,
    error: categoriesError,
  } = useGetCategories()

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  // Función para filtrar categorías basándose en la búsqueda
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    
    if (!debouncedSearchQuery.trim()) {
      return categories
    }

    const query = debouncedSearchQuery.toLowerCase().trim()
    
    // Filtrar tanto categorías padre como subcategorías
    const filtered = categories.filter(category => {
      // Buscar en categoría padre
      const parentMatches = category.name.toLowerCase().includes(query) ||
                           category.description.toLowerCase().includes(query)
      
      // Buscar en subcategorías
      const subcategoryMatches = category.subcategories?.some(sub =>
        sub.name.toLowerCase().includes(query) ||
        sub.description.toLowerCase().includes(query)
      )
      
      return parentMatches || subcategoryMatches
    }).map(category => {
      // Si la categoría padre no coincide pero sus subcategorías sí,
      // filtrar solo las subcategorías que coinciden
      if (!category.name.toLowerCase().includes(query) && 
          !category.description.toLowerCase().includes(query) &&
          category.subcategories) {
        return {
          ...category,
          subcategories: category.subcategories.filter(sub =>
            sub.name.toLowerCase().includes(query) ||
            sub.description.toLowerCase().includes(query)
          )
        }
      }
      return category
    })
    
    return filtered
  }, [categories, debouncedSearchQuery])

  // Contar total de elementos (categorías + subcategorías)
  const getTotalCount = (cats: Category[]) => {
    return cats.reduce((total, cat) => {
      return total + 1 + (cat.subcategories?.length || 0)
    }, 0)
  }

  const totalCount = categories ? getTotalCount(categories) : 0
  const filteredCount = getTotalCount(filteredCategories)

  const handleCreate = async (values: CategoryFormValues) => {
    await createCategory(values)
    setIsCreateDialogOpen(false)
  }

  const handleCreateSubcategory = async (values: CategoryFormValues) => {
    await createCategory(values)
    setIsCreateSubcategoryDialogOpen(false)
    setSelectedParentCategory(undefined)
  }

  const handleUpdate = async (values: CategoryFormValues) => {
    if (selectedCategory) {
      // Solo enviar los campos que han cambiado
      const updateData: { name?: string; description?: string } = {}
      
      if (values.name !== selectedCategory.name) {
        updateData.name = values.name
      }
      
      if (values.description !== selectedCategory.description) {
        updateData.description = values.description
      }

      if (Object.keys(updateData).length > 0) {
        await updateCategory({
          id: selectedCategory.id,
          data: updateData,
        })
      }
      
      setIsEditDialogOpen(false)
      setSelectedCategory(undefined)
    }
  }

  const handleDelete = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id)
      setIsDeleteDialogOpen(false)
      setSelectedCategory(undefined)
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsViewDialogOpen(true)
  }

  const openCreateSubcategoryDialog = (parentCategory: Category) => {
    setSelectedParentCategory(parentCategory)
    setIsCreateSubcategoryDialogOpen(true)
  }

  return (
    <ContentSection
      title='Categorías de Productos'
      desc='Administra las categorías y subcategorías para organizar tus productos'
    >
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <h3 className='text-lg font-medium'>Tus categorías</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Nueva categoría
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Buscar categorías o subcategorías...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Mostrar información de búsqueda */}
        {debouncedSearchQuery && (
          <div className='text-sm text-muted-foreground'>
            {filteredCount === 0 
              ? `No se encontraron categorías que coincidan con "${debouncedSearchQuery}"`
              : `Mostrando ${filteredCount} de ${totalCount} elementos`
            }
          </div>
        )}

        {isLoadingCategories && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando categorías...</span>
          </div>
        )}

        {categoriesError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar las categorías</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las categorías. Por favor, intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {categories && (
          <CategoryList
            categories={filteredCategories}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
            onCreateSubcategory={openCreateSubcategoryDialog}
          />
        )}

        {/* View Dialog */}
        {selectedCategory && (
          <ViewCategoryDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedCategory(undefined)
            }}
            data={selectedCategory}
            allCategories={categories}
          />
        )}

        {/* Create Category Dialog */}
        <CategoryDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          parentCategories={categories}
          title='Crear categoría'
          submitLabel='Crear'
          mode='create'
        />

        {/* Create Subcategory Dialog */}
        <CategoryDialog
          isOpen={isCreateSubcategoryDialogOpen}
          onClose={() => {
            setIsCreateSubcategoryDialogOpen(false)
            setSelectedParentCategory(undefined)
          }}
          onSubmit={handleCreateSubcategory}
          isSubmitting={isCreating}
          parentCategories={categories}
          selectedParentCategory={selectedParentCategory}
          title='Crear subcategoría'
          submitLabel='Crear subcategoría'
          mode='create-subcategory'
        />

        {/* Edit Dialog */}
        <CategoryDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedCategory(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedCategory}
          parentCategories={categories}
          title='Editar categoría'
          submitLabel='Actualizar'
          mode='edit'
        />

        {/* Delete Dialog */}
        <DeleteCategoryDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedCategory(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          category={selectedCategory}
        />
      </div>
    </ContentSection>
  )
}

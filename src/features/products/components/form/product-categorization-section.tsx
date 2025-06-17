import { Control } from 'react-hook-form';
import { Tags, FolderOpen, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CreateProductForm, Category, ProductTag } from '../../types';

interface ProductCategorizationSectionProps {
  control: Control<CreateProductForm>;
  categories: Category[];
  tags: ProductTag[];
}

export function ProductCategorizationSection({ 
  control, 
  categories, 
  tags 
}: ProductCategorizationSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Filtrar solo las categorías padre (que no tienen parentCategoryId)
  // El backend ya devuelve las subcategorías anidadas en la propiedad 'subcategories'
  const parentCategories = categories.filter(cat => !cat.parentCategoryId);

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Función helper para obtener el nombre completo de una subcategoría
  const getSubcategoryFullName = (subcategoryId: string): string => {
    // Buscar la subcategoría en todas las categorías padre
    for (const parentCategory of parentCategories) {
      if (parentCategory.subcategories) {
        const subcategory = parentCategory.subcategories.find(sub => sub.id === subcategoryId);
        if (subcategory) {
          return `${parentCategory.name} > ${subcategory.name}`;
        }
      }
    }
    // Si no se encuentra en subcategorías, buscar en todas las categorías (por si acaso)
    const category = categories.find(cat => cat.id === subcategoryId);
    return category?.name || 'Categoría no encontrada';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Categorización
          <span className="text-sm font-normal text-muted-foreground">
            (Opcional)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categorías y Subcategorías */}
        <div className="space-y-4">
          {/* Categorías Principales */}
          <FormField
            control={control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Categorías Principales
                </FormLabel>
                {parentCategories.length > 0 ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-60 w-full border rounded-md p-3">
                      <div className="space-y-2">
                        {parentCategories.map((parentCategory) => (
                          <div key={parentCategory.id} className="space-y-2">
                            {/* Categoría Principal */}
                            <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Checkbox
                                checked={field.value?.includes(parentCategory.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, parentCategory.id]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter((id) => id !== parentCategory.id)
                                    );
                                  }
                                }}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium leading-none">
                                    {parentCategory.name}
                                  </p>
                                  {parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {parentCategory.subcategories.length} subcategorías
                                    </Badge>
                                  )}
                                </div>
                                {parentCategory.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {parentCategory.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Mostrar categorías principales seleccionadas */}
                    {field.value && field.value.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Categorías principales seleccionadas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((categoryId) => {
                            const category = parentCategories.find(c => c.id === categoryId);
                            return category ? (
                              <Badge key={categoryId} variant="outline">
                                📁 {category.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FolderOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No hay categorías disponibles</p>
                    <p className="text-xs">
                      Crea categorías desde la configuración para organizar tus productos
                    </p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subcategorías */}
          <FormField
            control={control}
            name="subcategoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Subcategorías
                </FormLabel>
                {parentCategories.some(cat => cat.subcategories && cat.subcategories.length > 0) ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-60 w-full border rounded-md p-3">
                      <div className="space-y-3">
                        {parentCategories.map((parentCategory) => (
                          parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                            <div key={parentCategory.id} className="space-y-2">
                              {/* Header de la categoría padre */}
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleCategoryExpansion(parentCategory.id)}
                                >
                                  {expandedCategories.has(parentCategory.id) ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {parentCategory.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {parentCategory.subcategories.length}
                                </Badge>
                              </div>
                              
                              {/* Subcategorías */}
                              {expandedCategories.has(parentCategory.id) && (
                                <div className="space-y-2 ml-6 animate-in slide-in-from-top-2 duration-200">
                                  {parentCategory.subcategories.map((subcategory) => (
                                    <div key={subcategory.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <Checkbox
                                        checked={field.value?.includes(subcategory.id) || false}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          if (checked) {
                                            field.onChange([...currentValue, subcategory.id]);
                                          } else {
                                            field.onChange(
                                              currentValue.filter((id) => id !== subcategory.id)
                                            );
                                          }
                                        }}
                                      />
                                      <div className="space-y-1">
                                        <p className="text-sm leading-none">
                                          {subcategory.name}
                                        </p>
                                        {subcategory.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {subcategory.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Mostrar subcategorías seleccionadas */}
                    {field.value && field.value.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Subcategorías seleccionadas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((subcategoryId) => {
                            const fullName = getSubcategoryFullName(subcategoryId);
                            return (
                              <Badge key={subcategoryId} variant="outline" className="text-xs">
                                📂 {fullName}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Folder className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No hay subcategorías disponibles</p>
                    <p className="text-xs">
                      Crea subcategorías desde la configuración para una mejor organización
                    </p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Etiquetas */}
        <FormField
          control={control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Etiquetas
              </FormLabel>
              {tags.length > 0 ? (
                <div className="space-y-4">
                  <ScrollArea className="h-40 w-full border rounded-md p-3">
                    <div className="space-y-3">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-3">
                          <Checkbox
                            checked={field.value?.includes(tag.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, tag.id]);
                              } else {
                                field.onChange(
                                  currentValue.filter((id) => id !== tag.id)
                                );
                              }
                            }}
                          />
                          <Badge 
                            variant="outline"
                            className="text-sm"
                            style={{
                              backgroundColor: tag.color ? `${tag.color}20` : undefined,
                              borderColor: tag.color || undefined,
                              color: tag.color || undefined,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Mostrar etiquetas seleccionadas */}
                  {field.value && field.value.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Etiquetas seleccionadas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
                          return (
                            <Badge 
                              key={tagId} 
                              variant="secondary"
                              style={{
                                backgroundColor: tag?.color ? `${tag.color}20` : undefined,
                                borderColor: tag?.color || undefined,
                                color: tag?.color || undefined,
                              }}
                            >
                              {tag?.name || 'Etiqueta no encontrada'}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Tags className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No hay etiquetas disponibles</p>
                  <p className="text-xs">
                    Crea etiquetas desde la configuración para etiquetar tus productos
                  </p>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

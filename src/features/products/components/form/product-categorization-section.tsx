import { Control, useController } from 'react-hook-form';
import { Tags, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
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
    for (const parentCategory of parentCategories) {
      if (parentCategory.subcategories) {
        const subcategory = parentCategory.subcategories.find(sub => sub.id === subcategoryId);
        if (subcategory) {
          return `${parentCategory.name} > ${subcategory.name}`;
        }
      }
    }
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
          {/* Categorías */}
          <FormField
            control={control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Categorías
                </FormLabel>
                {parentCategories.length > 0 ? (
                  <div className="space-y-3">
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {parentCategories.map((parentCategory) => {
                          const isExpanded = expandedCategories.has(parentCategory.id);
                          const hasSubcategories = parentCategory.subcategories && parentCategory.subcategories.length > 0;
                          const isSelected = field.value?.includes(parentCategory.id) || false;

                          return (
                            <div key={parentCategory.id} className="space-y-2">
                              {/* Categoría Principal */}
                              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                                {/* Botón de expansión */}
                                {hasSubcategories ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => toggleCategoryExpansion(parentCategory.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                ) : (
                                  <div className="w-6" />
                                )}
                                
                                {/* Checkbox */}
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, parentCategory.id]);
                                    } else {
                                      field.onChange(currentValue.filter((id) => id !== parentCategory.id));
                                    }
                                  }}
                                />
                                
                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium leading-none truncate">
                                      {parentCategory.name}
                                    </p>
                                    {hasSubcategories && (
                                      <Badge variant="secondary" className="text-xs">
                                        {parentCategory.subcategories?.length || 0}
                                      </Badge>
                                    )}
                                  </div>
                                  {parentCategory.description && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      {parentCategory.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Subcategorías - Solo mostrar si está expandida */}
                              {hasSubcategories && isExpanded && (
                                <SubcategorySection 
                                  control={control}
                                  parentCategory={parentCategory}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Mostrar selecciones */}
                    <SelectionsDisplay 
                      control={control}
                      selectedCategories={field.value || []}
                      getSubcategoryFullName={getSubcategoryFullName}
                      parentCategories={parentCategories}
                    />
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border rounded-md">
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
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Checkbox
                            checked={field.value?.includes(tag.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, tag.id]);
                              } else {
                                field.onChange(currentValue.filter((id) => id !== tag.id));
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
                  </div>
                  
                  {/* Mostrar etiquetas seleccionadas */}
                  {field.value && field.value.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Etiquetas seleccionadas ({field.value.length}):
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
                <div className="text-center py-6 text-muted-foreground border rounded-md">
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

// Componente para mostrar selecciones
interface SelectionsDisplayProps {
  control: Control<CreateProductForm>;
  selectedCategories: string[];
  getSubcategoryFullName: (id: string) => string;
  parentCategories: Category[];
}

function SelectionsDisplay({ 
  control, 
  selectedCategories, 
  getSubcategoryFullName, 
  parentCategories 
}: SelectionsDisplayProps) {
  const { field: subcategoryField } = useController({
    control,
    name: 'subcategoryIds',
    defaultValue: []
  });

  const selectedSubcategories = subcategoryField.value || [];
  const totalSelected = selectedCategories.length + selectedSubcategories.length;

  if (totalSelected === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Selecciones ({totalSelected}):
      </p>
      <div className="flex flex-wrap gap-2">
        {/* Categorías principales */}
        {selectedCategories.map((categoryId) => {
          const category = parentCategories.find(c => c.id === categoryId);
          return category ? (
            <Badge key={categoryId} variant="outline" className="text-xs">
              {category.name}
            </Badge>
          ) : null;
        })}
        
        {/* Subcategorías */}
        {selectedSubcategories.map((subcategoryId) => {
          const fullName = getSubcategoryFullName(subcategoryId);
          return (
            <Badge key={subcategoryId} variant="secondary" className="text-xs">
              {fullName}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

// Componente separado para manejar subcategorías
interface SubcategorySectionProps {
  control: Control<CreateProductForm>;
  parentCategory: Category;
}

function SubcategorySection({ control, parentCategory }: SubcategorySectionProps) {
  const { field } = useController({
    control,
    name: 'subcategoryIds',
    defaultValue: []
  });

  return (
    <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
      {parentCategory.subcategories?.map((subcategory) => (
        <div key={subcategory.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="w-6" /> {/* Espaciado para alineación */}
          <Checkbox
            checked={field.value?.includes(subcategory.id) || false}
            onCheckedChange={(checked) => {
              const currentValue = field.value || [];
              if (checked) {
                field.onChange([...currentValue, subcategory.id]);
              } else {
                field.onChange(currentValue.filter((id) => id !== subcategory.id));
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-none truncate">
              {subcategory.name}
            </p>
            {subcategory.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subcategory.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { Control } from 'react-hook-form';
import { Tags, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
              {categories.length > 0 ? (
                <ScrollArea className="h-40 w-full border rounded-md p-3">
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-start space-x-3">
                        <Checkbox
                          checked={field.value?.includes(category.id) || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, category.id]);
                            } else {
                              field.onChange(
                                currentValue.filter((id) => id !== category.id)
                              );
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <FolderOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No hay categorías disponibles</p>
                  <p className="text-xs">
                    Crea categorías desde la configuración para organizar tus productos
                  </p>
                </div>
              )}
              
              {/* Mostrar categorías seleccionadas */}
              {field.value && field.value.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Categorías seleccionadas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((categoryId) => {
                      const category = categories.find(c => c.id === categoryId);
                      return (
                        <Badge key={categoryId} variant="outline">
                          {category?.name || 'Categoría no encontrada'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Tags className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No hay etiquetas disponibles</p>
                  <p className="text-xs">
                    Crea etiquetas desde la configuración para etiquetar tus productos
                  </p>
                </div>
              )}
              
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Información adicional */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Las categorías ayudan a organizar y filtrar productos</p>
          <p>• Las etiquetas permiten una clasificación más flexible</p>
          <p>• Puedes seleccionar múltiples categorías y etiquetas</p>
        </div>
      </CardContent>
    </Card>
  );
}

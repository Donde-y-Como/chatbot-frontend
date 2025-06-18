import { Control } from 'react-hook-form';
import { ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ProductImageUpload } from '../product-image-upload';
import { CreateProductForm } from '../../types';

interface ProductImagesSectionProps {
  control: Control<CreateProductForm>;
}

export function ProductImagesSection({ control }: ProductImagesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imágenes del producto
          <span className="text-sm font-normal text-muted-foreground">
            (Opcional)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Galería de imágenes</FormLabel>
              <FormControl>
                <ProductImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  maxImages={5}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Puedes subir hasta 5 imágenes. La primera imagen será la imagen principal del producto.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

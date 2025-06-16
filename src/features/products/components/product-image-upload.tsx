import { useRef } from 'react';
import { Camera, Upload, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProductImageUpload } from '../hooks/useProductImageUpload';

interface ProductImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ProductImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 5,
  className 
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    imageUrls,
    uploadingImages,
    isUploading,
    canAddMore,
    handleFileUpload,
    removeImage,
    reorderImages,
    setImages,
  } = useProductImageUpload({
    maxImages,
    onImagesChange: onChange,
  });

  // Sincronizar con el valor externo
  if (value.length !== imageUrls.length || !value.every((url, index) => url === imageUrls[index])) {
    setImages(value);
  }

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = (event: React.DragEvent) => {
    event.preventDefault();
    const startIndex = parseInt(event.dataTransfer.getData('text/plain'));
    const endIndex = parseInt((event.currentTarget as HTMLElement).dataset.index || '0');
    
    if (startIndex !== endIndex) {
      reorderImages(startIndex, endIndex);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Botón de subida principal */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          canAddMore ? 'border-gray-300 hover:border-gray-400' : 'border-gray-200 cursor-not-allowed opacity-50'
        )}
        onClick={canAddMore ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
            <Camera className="h-6 w-6 text-gray-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {canAddMore ? 'Subir imágenes' : `Máximo ${maxImages} imágenes`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {canAddMore 
                ? 'Arrastra archivos aquí o haz clic para seleccionar'
                : 'Elimina algunas imágenes para agregar más'
              }
            </p>
            {canAddMore && (
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, WebP hasta 5MB
              </p>
            )}
          </div>
          {canAddMore && (
            <Button type="button" variant="outline" className="mt-4" disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Subiendo...' : 'Seleccionar archivos'}
            </Button>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Grid de imágenes */}
      {(imageUrls.length > 0 || uploadingImages.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Imágenes del producto ({imageUrls.length}/{maxImages})
            </h4>
            {imageUrls.length > 0 && (
              <Badge variant="outline" className="text-xs">
                La primera imagen será la principal
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Imágenes subidas */}
            {imageUrls.map((url, index) => (
              <div
                key={url}
                data-index={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                className="relative group aspect-square"
              >
                <Card className="h-full overflow-hidden">
                  <div className="relative h-full">
                    <img
                      src={url}
                      alt={`Producto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    
                    {/* Badge de imagen principal */}
                    {index === 0 && (
                      <Badge 
                        variant="default" 
                        className="absolute top-1 left-1 text-xs px-1 py-0"
                      >
                        Principal
                      </Badge>
                    )}
                    
                    {/* Botón de eliminar */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    {/* Handle para arrastrar */}
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-white drop-shadow-sm" />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            
            {/* Placeholders para imágenes en proceso de subida */}
            {uploadingImages.map((tempId) => (
              <div key={tempId} className="relative aspect-square">
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full p-2">
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-gray-400 animate-pulse" />
                      <p className="mt-1 text-xs text-gray-500">Subiendo...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

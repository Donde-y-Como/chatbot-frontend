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
import { FileUpload } from '@/components/file-upload';
import { useState } from 'react';
import { useUploadMedia } from '@/features/chats/hooks/useUploadMedia';
import { toast } from 'sonner';
import { EquipmentStatus } from '../../../types';

type EquipmentFormData = {
  name: string;
  status: EquipmentStatus;
  category?: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  photos: string[];
  purchaseDate?: string;
  lastMaintenanceDate?: string;
};

interface EquipmentImagesSectionProps {
  control: Control<EquipmentFormData>;
}

export function EquipmentImagesSection({ control }: EquipmentImagesSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { uploadFile, validateFile, isUploading } = useUploadMedia();

  const handleFileUpload = async (newFiles: File[], field: any) => {
    if (newFiles.length === 0) {
      setFiles([]);
      return;
    }

    setFiles(newFiles);
    const uploadedUrls: string[] = [...field.value];

    try {
      for (const file of newFiles) {
        const { isValid } = validateFile(file);
        if (!isValid) {
          toast.error(`El archivo ${file.name} no es válido`);
          continue;
        }

        const url = await uploadFile(file);
        uploadedUrls.push(url);
        toast.success(`Imagen ${file.name} subida exitosamente`);
      }

      field.onChange(uploadedUrls);
      setFiles([]);
    } catch (error) {
      toast.error('Error al subir algunas imágenes');
    }
  };

  const removeImage = (index: number, field: any) => {
    const newPhotos = field.value.filter((_: string, i: number) => i !== index);
    field.onChange(newPhotos);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imágenes del equipo
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
                <div className="space-y-4">
                  <FileUpload
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024}
                    value={files}
                    onChange={(newFiles) => handleFileUpload(newFiles, field)}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                    }}
                  />
                  
                  {isUploading && (
                    <div className="text-sm text-blue-600 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Subiendo imágenes...
                    </div>
                  )}
                  
                  {/* Mostrar imágenes existentes */}
                  {field.value && field.value.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {field.value.map((url: string, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, field)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Puedes subir hasta 5 imágenes. La primera imagen será la imagen principal del equipo.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
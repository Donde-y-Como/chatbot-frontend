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

type ConsumableFormData = {
  name: string;
  stock: number;
  description?: string;
  photo?: string;
  brand?: string;
  model?: string;
  category?: string;
};

interface ConsumableImagesSectionProps {
  control: Control<ConsumableFormData>;
}

export function ConsumableImagesSection({ control }: ConsumableImagesSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { uploadFile, validateFile, isUploading } = useUploadMedia();

  const handleFileUpload = async (newFiles: File[], field: any) => {
    if (newFiles.length === 0) {
      setFiles([]);
      return;
    }

    setFiles(newFiles);

    try {
      const file = newFiles[0]; // Solo tomar el primer archivo
      const { isValid } = validateFile(file);
      if (!isValid) {
        toast.error(`El archivo ${file.name} no es válido`);
        return;
      }

      const url = await uploadFile(file);
      field.onChange(url);
      toast.success(`Imagen ${file.name} subida exitosamente`);
      setFiles([]);
    } catch (error) {
      toast.error('Error al subir la imagen');
    }
  };

  const removeImage = (field: any) => {
    field.onChange('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imagen del consumible
          <span className="text-sm font-normal text-muted-foreground">
            (Opcional)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen principal</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <FileUpload
                    maxFiles={1}
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
                      Subiendo imagen...
                    </div>
                  )}
                  
                  {/* Mostrar imagen existente */}
                  {field.value && (
                    <div className="relative group inline-block">
                      <img
                        src={field.value}
                        alt="Imagen del consumible"
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(field)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Sube una imagen que represente el consumible.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
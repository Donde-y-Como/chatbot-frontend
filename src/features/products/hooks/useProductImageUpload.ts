import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseProductImageUploadProps {
  maxImages?: number;
  onImagesChange?: (urls: string[]) => void;
}

export const useProductImageUpload = ({ 
  maxImages = 5, 
  onImagesChange 
}: UseProductImageUploadProps = {}) => {
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Usar el mismo servicio que usa el proyecto para subir archivos
    const { api } = await import('@/api/axiosInstance.ts');
    
    const response = await api.post('/file-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status !== 200) {
      throw new Error('Error al subir imagen');
    }

    return response.data.url;
  }, []);

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validar número máximo de imágenes
    if (imageUrls.length + fileArray.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Solo se permiten archivos de imagen (JPG, PNG, WebP)');
      return;
    }

    // Validar tamaño de archivo (máximo 5MB por imagen)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Las imágenes deben ser menores a 5MB');
      return;
    }

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const tempId = Math.random().toString(36).substr(2, 9);
        setUploadingImages(prev => [...prev, tempId]);
        
        try {
          const url = await uploadFile(file);
          setUploadingImages(prev => prev.filter(id => id !== tempId));
          return url;
        } catch (error) {
          setUploadingImages(prev => prev.filter(id => id !== tempId));
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);
      const newImageUrls = [...imageUrls, ...urls];
      setImageUrls(newImageUrls);
      onImagesChange?.(newImageUrls);
      
      toast.success(`${urls.length} imagen(es) subida(s) exitosamente`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error al subir imágenes');
    }
  }, [imageUrls, maxImages, onImagesChange, uploadFile]);

  const removeImage = useCallback((indexToRemove: number) => {
    const newImageUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newImageUrls);
    onImagesChange?.(newImageUrls);
  }, [imageUrls, onImagesChange]);

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    const newImageUrls = [...imageUrls];
    const [removed] = newImageUrls.splice(startIndex, 1);
    newImageUrls.splice(endIndex, 0, removed);
    setImageUrls(newImageUrls);
    onImagesChange?.(newImageUrls);
  }, [imageUrls, onImagesChange]);

  const setImages = useCallback((urls: string[]) => {
    setImageUrls(urls);
    onImagesChange?.(urls);
  }, [onImagesChange]);

  const clearImages = useCallback(() => {
    setImageUrls([]);
    onImagesChange?.([]);
  }, [onImagesChange]);

  return {
    imageUrls,
    uploadingImages,
    isUploading: uploadingImages.length > 0,
    canAddMore: imageUrls.length < maxImages,
    handleFileUpload,
    removeImage,
    reorderImages,
    setImages,
    clearImages,
  };
};

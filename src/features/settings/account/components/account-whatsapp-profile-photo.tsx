import React, { useState, useRef, ChangeEvent } from 'react';
import { useUploadMedia } from '../../../chats/hooks/useUploadMedia';
import { api } from '@/api/axiosInstance';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast} from 'sonner'

interface ProfilePhotoProps {
  currentPhotoUrl?: string;
  username?: string;
  onPhotoUpdated?: (url: string) => void;
}

const AccountWhatsappProfilePhoto: React.FC<ProfilePhotoProps> = ({
  currentPhotoUrl,
  username = 'User',
  onPhotoUpdated,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhotoUrl);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoUrl);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, validateFile, isUploading, progress } = useUploadMedia();
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { isValid, type } = validateFile(file);

    if (!isValid || type !== 'image') {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG)');
      return;
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsEditing(true);

    // We don't upload immediately, user needs to confirm
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadFile(file);


      setPhotoUrl(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      setIsEditing(false);
      
      if (onPhotoUpdated) {
        onPhotoUpdated(uploadedUrl);
      }

      toast.success('Photo ready to update. you need to update de profile')

    } catch (error) {
       toast.error('Error uploading photo to update');
    }
  };

  const cancelUpload = () => {
    setPreviewUrl(photoUrl);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-2 border-gray-200">
          <AvatarImage src={previewUrl} alt={username} />
          <AvatarFallback>{getInitials(username)}</AvatarFallback>
        </Avatar>
        
        {!isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-0 right-0 rounded-full p-2"
            onClick={triggerFileInput}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpg,image/jpeg"
        className="hidden"
      />

      {isEditing && (
        <div className="flex flex-col space-y-2 w-full max-w-xs">
          {isUploading && (
            <Progress value={progress} className="w-full h-2" />
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelUpload}
              disabled={isUploading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? `Subiendo ${progress}%` : 'Guardar'}
            </Button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AccountWhatsappProfilePhoto;
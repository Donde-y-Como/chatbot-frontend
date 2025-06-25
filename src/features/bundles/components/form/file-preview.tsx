import { useState } from 'react';
import { Eye, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Media } from '@/features/chats/ChatTypes';

interface FilePreviewProps {
  media: Media;
  showPreviewButton?: boolean;
}

export function FilePreview({ media, showPreviewButton = true }: FilePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const renderThumbnail = () => {
    switch (media.type) {
      case 'image':
        return (
          <img
            src={media.url}
            alt={media.filename || 'Image'}
            className="h-16 w-16 object-cover rounded border"
          />
        );
      
      case 'video':
        return (
          <video
            src={media.url}
            className="h-16 w-16 object-cover rounded border"
            muted
            preload="metadata"
          />
        );
      
      case 'document':
        return (
          <div className="h-16 w-16 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        );
      
      default:
        return (
          <div className="h-16 w-16 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
        );
    }
  };

  const renderFullPreview = () => {
    switch (media.type) {
      case 'image':
        return (
          <div className="max-w-full max-h-[80vh] overflow-auto">
            <img
              src={media.url}
              alt={media.filename || 'Image'}
              className="max-w-full h-auto"
            />
          </div>
        );
      
      case 'video':
        return (
          <video
            src={media.url}
            controls
            className="max-w-full max-h-[80vh]"
          >
            Tu navegador no soporta el elemento video.
          </video>
        );
      
      case 'document':
        return (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Vista previa no disponible</p>
            <p className="text-muted-foreground mb-4">
              {media.filename || 'Documento'}
            </p>
            <Button asChild>
              <a href={media.url} target="_blank" rel="noopener noreferrer">
                Abrir archivo
              </a>
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Vista previa no disponible</p>
            <Button asChild>
              <a href={media.url} target="_blank" rel="noopener noreferrer">
                Abrir archivo
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <div className="relative group">
        {renderThumbnail()}
        
        {showPreviewButton && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
        
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{media.filename || 'Vista previa'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto">
            {renderFullPreview()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from "@/components/ui/button";

interface MediaProps {
  media: {
    type: "document" | "video" | "image";
    url: string;
  };
}

export const MediaPreview: React.FC<MediaProps> = ({ media }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = media.url.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (media.type === 'document') {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-foreground">📎</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="text-xs hover:text-primary"
        >
          Descargar documento
          <Download className="ml-2 h-3 w-3" />
        </Button>
      </div>
    );
  }

  const MediaContent = () => (
    <div className="relative w-full h-full flex items-center justify-center">
      {media.type === 'image' ? (
        <img
          src={media.url}
          alt="Media preview"
          className="max-w-full max-h-[70vh] object-contain rounded-lg"
        />
      ) : (
        <video
          controls
          className="max-w-full max-h-[70vh] rounded-lg bg-background"
        >
          <source src={media.url} />
          Your browser does not support the video tag.
        </video>
      )}
      <Button
        size="sm"
        className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer max-w-[200px] rounded-lg overflow-hidden">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <video className="w-full max-h-[150px] bg-background">
              <source src={media.url} />
            </video>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-background p-6">
        <DialogTitle className="sr-only">
          Vista previa del archivo
        </DialogTitle>

        <DialogDescription>Archivo</DialogDescription>
        <MediaContent />
      </DialogContent>
    </Dialog>
  );
};
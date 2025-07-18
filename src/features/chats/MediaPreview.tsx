import React, { useCallback, useState } from 'react'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Media } from '@/features/chats/ChatTypes.ts'

interface MediaProps {
  media: Media
}

interface LoadingState {
  isLoading: boolean
  error: string | null
}

export const MediaPreview: React.FC<MediaProps> = ({ media }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [imageLoading, setImageLoading] = useState<LoadingState>({
    isLoading: true,
    error: null,
  })
  const [downloadLoading, setDownloadLoading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (downloadLoading) return

    setDownloadLoading(true)
    try {
      const response = await fetch(media.url)

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      // Use filename from media or extract from URL
      const filename =
        media.filename || media.url.split('/').pop() || 'download'
      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Archivo descargado exitosamente')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Error al descargar el archivo')
    } finally {
      setDownloadLoading(false)
    }
  }, [media.url, media.filename, downloadLoading])

  const isDocument =
    media.type === 'document' || media.type === 'documentWithCaption'
  const isImage = media.type.includes('image') || media.type.includes('sticker')
  const isVideo = media.type.includes('video')

  const handleImageLoad = useCallback(() => {
    setImageLoading({ isLoading: false, error: null })
  }, [])

  const handleImageError = useCallback(() => {
    setImageLoading({ isLoading: false, error: 'Error al cargar la imagen' })
  }, [])

  if (isDocument) {
    return (
      <div className='flex items-center gap-2 py-1'>
        <span className='text-foreground' role='img' aria-label='Documento'>
          📎
        </span>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleDownload}
          disabled={downloadLoading}
          className='text-xs hover:text-primary disabled:opacity-50'
          aria-label={`Descargar ${media.filename || 'documento'}`}
        >
          {downloadLoading ? (
            <>
              <Loader2 className='mr-2 h-3 w-3 animate-spin' />
              Descargando...
            </>
          ) : (
            <>
              Descargar documento
              <Download className='ml-2 h-3 w-3' />
            </>
          )}
        </Button>
      </div>
    )
  }

  const MediaContent = () => (
    <div className='relative w-full h-full flex items-center justify-center min-h-[200px]'>
      {isImage ? (
        <div className='relative w-full h-full flex items-center justify-center'>
          {imageLoading.isLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          )}
          {imageLoading.error ? (
            <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground p-8'>
              <AlertCircle className='h-12 w-12' />
              <p className='text-sm text-center'>{imageLoading.error}</p>
            </div>
          ) : (
            <img
              src={media.url}
              alt={media.caption || 'Vista previa de imagen'}
              className='max-w-full max-h-[70vh] object-contain rounded-lg'
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading='lazy'
              style={{ display: imageLoading.isLoading ? 'none' : 'block' }}
            />
          )}
        </div>
      ) : isVideo ? (
        <video
          controls
          preload='metadata'
          className='max-w-full max-h-[70vh] rounded-lg bg-background'
          aria-label='Video preview'
        >
          <source src={media.url} type={media.mimetype || 'video/mp4'} />
          <p>Tu navegador no soporta la reproducción de video.</p>
        </video>
      ) : (
        <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground p-8'>
          <AlertCircle className='h-12 w-12' />
          <p className='text-sm text-center'>Tipo de archivo no soportado</p>
        </div>
      )}

      <Button
        size='sm'
        className='absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground shadow-md'
        onClick={handleDownload}
        disabled={downloadLoading}
        aria-label='Descargar archivo'
      >
        {downloadLoading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Download className='h-4 w-4' />
        )}
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className='cursor-pointer max-w-[200px] sm:max-w-[250px] rounded-lg overflow-hidden hover:opacity-90 transition-opacity'>
          {isImage ? (
            <div className='relative'>
              <img
                src={media.url}
                alt={media.caption || 'Vista previa'}
                className='w-full h-auto max-h-[150px] object-cover'
                loading='lazy'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex items-center justify-center h-[150px] bg-muted rounded-lg">
                        <div class="text-muted-foreground text-sm text-center">
                          <svg class="h-8 w-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                          Error al cargar imagen
                        </div>
                      </div>
                    `
                  }
                }}
              />
            </div>
          ) : isVideo ? (
            <video
              muted
              preload='metadata'
              className='w-full max-h-[150px] bg-background object-cover'
              poster={media.url + '#t=1'}
            >
              <source src={media.url} type={media.mimetype || 'video/mp4'} />
            </video>
          ) : (
            <div className='flex items-center justify-center h-[150px] bg-muted rounded-lg'>
              <div className='text-muted-foreground text-sm text-center'>
                <span className='text-2xl'>📹</span>
                <p>Vista previa no disponible</p>
              </div>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-4xl bg-background p-6 max-h-[90vh] overflow-auto'>
        <DialogTitle className='sr-only'>
          Vista previa del archivo{media.filename ? `: ${media.filename}` : ''}
        </DialogTitle>
        <DialogDescription className='sr-only'>
          {isImage ? 'Imagen' : isVideo ? 'Video' : 'Archivo multimedia'}
          {media.caption && ` con descripción: ${media.caption}`}
        </DialogDescription>
        <MediaContent />
        {media.caption && (
          <div className='mt-4 p-3 bg-muted rounded-lg'>
            <p className='text-sm text-muted-foreground'>Descripción:</p>
            <p className='text-sm mt-1'>{media.caption}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

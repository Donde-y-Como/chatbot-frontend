import * as React from 'react'
import { useCallback, useState } from 'react'
import { FileText, Play, Upload, Video, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface FileWithPreview {
  id: string
  file: File
  preview: string
}

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  onChange?: (files: File[]) => void
  value?: File[]
  initialPreviews?: FileWithPreview[]
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  },
  onChange,
  value,
}: FileUploadProps) {
  const [previews, setPreviews] = useState<FileWithPreview[]>([])

  // Actualizar previews cuando cambia value
  React.useEffect(() => {
    if (value) {
      const newPreviews = value.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
      }))
      setPreviews((prev) => {
        // Limpiar URLs antiguos
        prev.forEach((p) => URL.revokeObjectURL(p.preview))
        return newPreviews
      })
    }
  }, [value])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setPreviews((prev) => {
        if (prev.length + acceptedFiles.length > maxFiles) {
          toast.error(`Solo puedes subir ${maxFiles} archivos`)
          return prev
        }

        const newPreviews = acceptedFiles.map((file) => ({
          id: Math.random().toString(36).slice(2),
          file,
          preview: URL.createObjectURL(file),
        }))

        const next = [...prev, ...newPreviews]
        onChange?.(next.map((p) => p.file))
        return next
      })
    },
    [maxFiles, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  })

  const removeFile = useCallback(
    (id: string) => {
      setPreviews((prev) => {
        const file = prev.find((f) => f.id === id)
        if (file) {
          URL.revokeObjectURL(file.preview)
          onChange?.(prev.filter((f) => f.id !== id).map((f) => f.file))
        }
        return prev.filter((f) => f.id !== id)
      })
    },
    [onChange]
  )

  // Limpiar URLs al desmontar
  React.useEffect(() => {
    return () => {
      previews.forEach((file) => {
        URL.revokeObjectURL(file.preview)
      })
    }
  }, [previews])

  return (
    <div className='w-full'>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 sm:p-8 transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25'
        )}
      >
        <input {...getInputProps()} aria-label='File upload' />
        <div className='text-center cursor-pointer'>
          <Upload
            className='mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground'
            aria-hidden='true'
          />
          <h3 className='mt-2 text-sm font-medium'>
            Arrastra archivos aquí o selecciona
          </h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            Archivos hasta {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className='mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {previews.map((file) => {
            const isImage = file.file.type.startsWith('image/')
            const isVideo = file.file.type.startsWith('video/')
            return (
              <div
                key={file.id}
                className='group relative aspect-square overflow-hidden rounded-lg border bg-background'
              >
                {isImage ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className='h-full w-full cursor-pointer object-cover transition-all hover:opacity-80'
                  />
                ) : isVideo ? (
                  <div className='relative h-full w-full'>
                    <video
                      src={file.preview}
                      className='h-full w-full object-cover'
                      muted
                      playsInline
                    />
                    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                      <div className='rounded-full bg-background/70 p-2 backdrop-blur'>
                        <Play className='h-5 w-5' />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-muted'>
                    <FileText className='h-10 w-10 text-muted-foreground' />
                  </div>
                )}
                <div className='absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/80 p-2.5 backdrop-blur transition-all'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>
                      {file.file.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {(file.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => removeFile(file.id)}
                    aria-label='Remove file'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {isVideo && (
                  <div className='pointer-events-none absolute top-2 left-2 rounded-md bg-background/70 px-2 py-1 text-xs font-medium backdrop-blur flex items-center gap-1'>
                    <Video className='h-3.5 w-3.5' />
                    Video
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

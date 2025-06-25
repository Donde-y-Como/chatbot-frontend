import React, { useCallback, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { File, FileText, Image, Music, Upload, Video, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { formatFileSize } from '@/features/bundles/utils/fileUpload.ts'
import { Media } from '@/features/chats/ChatTypes'
import { CreateBundleForm, EditBundleForm } from '../../types'

// File type utilities
const getFileType = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  return 'document'
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image':
      return <Image className='h-5 w-5 text-blue-500' />
    case 'video':
      return <Video className='h-5 w-5 text-purple-500' />
    case 'audio':
      return <Music className='h-5 w-5 text-green-500' />
    case 'document':
      return <FileText className='h-5 w-5 text-orange-500' />
    default:
      return <File className='h-5 w-5 text-gray-500' />
  }
}

const isValidFileType = (mimetype: string): boolean => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    // Audio
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/xml',
    'text/xml',
  ]

  const dangerousTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-dosexec',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ]

  return allowedTypes.includes(mimetype) && !dangerousTypes.includes(mimetype)
}

interface FileWithPreview extends File {
  preview?: string
}

interface PendingFile {
  file: FileWithPreview
  type: string
  error?: string
}

export function BundleFilesForm() {
  const { control, watch, setValue } = useFormContext<
    CreateBundleForm | EditBundleForm
  >()
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFiles = watch('files') || []

  // Calculate total size including pending files
  const getTotalSize = useCallback(() => {
    const currentSize = pendingFiles.reduce(
      (total, pf) => total + pf.file.size,
      0
    )
    return currentSize
  }, [pendingFiles])

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newPendingFiles: PendingFile[] = []
      let currentTotalSize = getTotalSize()

      Array.from(files).forEach((file) => {
        // Check file type
        if (!isValidFileType(file.type)) {
          newPendingFiles.push({
            file,
            type: getFileType(file.type),
            error: `Tipo de archivo no permitido: ${file.type}`,
          })
          return
        }

        // Check size limit
        if (currentTotalSize + file.size > 100 * 1024 * 1024) {
          // 100MB
          newPendingFiles.push({
            file,
            type: getFileType(file.type),
            error: 'Excede el límite de 100MB total',
          })
          return
        }

        // Create preview for images
        let preview: string | undefined
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file)
        }

        const fileWithPreview = Object.assign(file, { preview })

        newPendingFiles.push({
          file: fileWithPreview,
          type: getFileType(file.type),
        })

        currentTotalSize += file.size
      })

      setPendingFiles((prev) => [...prev, ...newPendingFiles])
    },
    [getTotalSize]
  )

  // Remove pending file
  const removePendingFile = useCallback((index: number) => {
    setPendingFiles((prev) => {
      const newFiles = [...prev]
      const removedFile = newFiles[index]

      // Revoke object URL if it exists
      if (removedFile.file.preview) {
        URL.revokeObjectURL(removedFile.file.preview)
      }

      newFiles.splice(index, 1)
      return newFiles
    })
  }, [])

  // Remove existing file
  const removeExistingFile = useCallback(
    (index: number) => {
      const updatedFiles = [...currentFiles]
      updatedFiles.splice(index, 1)
      setValue('files', updatedFiles)
    },
    [currentFiles, setValue]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  // File input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
      e.target.value = '' // Reset input
    },
    [handleFileSelect]
  )

  // Get pending files for form submission
  const getPendingFilesForUpload = useCallback(() => {
    return pendingFiles.filter((pf) => !pf.error).map((pf) => pf.file)
  }, [pendingFiles])

  // Expose function to parent component
  React.useEffect(() => {
    // Store function in a way parent can access it
    ;(window as any)._getBundlePendingFiles = getPendingFilesForUpload
    ;(window as any)._clearBundlePendingFiles = () => {
      pendingFiles.forEach((pf) => {
        if (pf.file.preview) {
          URL.revokeObjectURL(pf.file.preview)
        }
      })
      setPendingFiles([])
    }

    return () => {
      delete (window as any)._getBundlePendingFiles
      delete (window as any)._clearBundlePendingFiles
    }
  }, [getPendingFilesForUpload, pendingFiles])

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='h-5 w-5' />
          Archivos del Paquete
          <span className='text-sm font-normal text-muted-foreground'>
            (Máximo 100MB total)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='files'
          render={() => (
            <FormItem>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                <p className='text-lg font-medium mb-2'>
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className='text-sm text-muted-foreground mb-4'>
                  Soporta imágenes, videos, audio y documentos
                </p>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar Archivos
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  className='hidden'
                  onChange={handleInputChange}
                  accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.xml'
                />
              </div>

              {/* Size indicator */}
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Total: {formatFileSize(getTotalSize())}</span>
                <span>Límite: 100MB</span>
              </div>

              {/* Existing Files */}
              {currentFiles.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>Archivos Actuales</h4>
                  {currentFiles.map((file, index) => (
                    <FilePreview
                      key={`existing-${index}`}
                      media={file}
                      onRemove={() => removeExistingFile(index)}
                      isExisting
                    />
                  ))}
                </div>
              )}

              {/* Pending Files */}
              {pendingFiles.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>Archivos Nuevos</h4>
                  {pendingFiles.map((pendingFile, index) => (
                    <PendingFilePreview
                      key={`pending-${index}`}
                      pendingFile={pendingFile}
                      onRemove={() => removePendingFile(index)}
                    />
                  ))}
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

// Component for existing file preview
function FilePreview({
  media,
  onRemove,
  isExisting,
}: {
  media: Media
  onRemove: () => void
  isExisting?: boolean
}) {
  return (
    <div className='flex items-center justify-between p-3 border rounded-lg'>
      <div className='flex items-center gap-3'>
        {getFileIcon(media.type)}
        <div>
          <p className='font-medium text-sm'>{media.filename || 'Archivo'}</p>
          <div className='flex items-center gap-2'>
            {media.mimetype && (
              <span className='text-xs text-muted-foreground'>
                {media.mimetype}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {isExisting && (
          <Badge variant='secondary' className='text-xs'>
            Guardado
          </Badge>
        )}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onRemove}
          className='text-destructive hover:text-destructive'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

// Component for pending file preview
function PendingFilePreview({
  pendingFile,
  onRemove,
}: {
  pendingFile: PendingFile
  onRemove: () => void
}) {
  const { file, type, error } = pendingFile

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${
        error ? 'border-destructive bg-destructive/5' : ''
      }`}
    >
      <div className='flex items-center gap-3'>
        {/* Preview or icon */}
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className='h-10 w-10 object-cover rounded'
          />
        ) : (
          getFileIcon(type)
        )}

        <div>
          <p className='font-medium text-sm'>{file.name}</p>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {formatFileSize(file.size)}
            </span>
            {file.type && (
              <span className='text-xs text-muted-foreground'>{file.type}</span>
            )}
          </div>
          {error && <p className='text-xs text-destructive mt-1'>{error}</p>}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {!error && (
          <Badge variant='outline' className='text-xs'>
            Pendiente
          </Badge>
        )}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onRemove}
          className='text-destructive hover:text-destructive'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { getFileType, isValidFileType } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getFileIcon } from '@/features/bundles/components/form/bundle-files-form.tsx'
import { formatFileSize } from '@/features/bundles/utils/fileUpload.ts'
import { Annex, CreateClientForm } from '../../types'

interface FileWithPreview extends File {
  preview?: string
}

interface PendingAnnex {
  file: FileWithPreview
  name: string
  type: string
  error?: string
}

export function ClientAnnexesForm() {
  const { control, watch, setValue } = useFormContext<CreateClientForm>()
  const [pendingAnnexes, setPendingAnnexes] = useState<PendingAnnex[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [newAnnexName, setNewAnnexName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentAnnexes = useMemo(() => watch('annexes') || [], [watch])

  // Calculate total size including pending annexes
  const getTotalSize = useCallback(() => {
    return pendingAnnexes.reduce((total, pa) => total + pa.file.size, 0)
  }, [pendingAnnexes])

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || !newAnnexName.trim()) {
        if (!newAnnexName.trim()) {
          alert(
            'Por favor ingresa un nombre para el anexo antes de seleccionar archivos'
          )
        }
        return
      }

      const newPendingAnnexes: PendingAnnex[] = []
      let currentTotalSize = getTotalSize()

      Array.from(files).forEach((file) => {
        // Check file type
        if (!isValidFileType(file.type)) {
          newPendingAnnexes.push({
            file,
            name: newAnnexName,
            type: getFileType(file.type),
            error: `Tipo de archivo no permitido: ${file.type}`,
          })
          return
        }

        // Check size limit
        if (currentTotalSize + file.size > 100 * 1024 * 1024) {
          // 100MB
          newPendingAnnexes.push({
            file,
            name: newAnnexName,
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

        newPendingAnnexes.push({
          file: fileWithPreview,
          name: newAnnexName,
          type: getFileType(file.type),
        })

        currentTotalSize += file.size
      })

      setPendingAnnexes((prev) => [...prev, ...newPendingAnnexes])
      setNewAnnexName('') // Clear name after adding
    },
    [getTotalSize, newAnnexName]
  )

  // Remove pending annex
  const removePendingAnnex = useCallback((index: number) => {
    setPendingAnnexes((prev) => {
      const newAnnexes = [...prev]
      const removedAnnex = newAnnexes[index]

      // Revoke object URL if it exists
      if (removedAnnex.file.preview) {
        URL.revokeObjectURL(removedAnnex.file.preview)
      }

      newAnnexes.splice(index, 1)
      return newAnnexes
    })
  }, [])

  // Remove existing annex
  const removeExistingAnnex = useCallback(
    (index: number) => {
      const updatedAnnexes = [...currentAnnexes]
      updatedAnnexes.splice(index, 1)
      setValue('annexes', updatedAnnexes)
    },
    [currentAnnexes, setValue]
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

  // Get pending annexes for form submission
  const getPendingAnnexesForUpload = useCallback(() => {
    return pendingAnnexes.filter((pa) => !pa.error)
  }, [pendingAnnexes])

  // Expose function to parent component (like bundles)
  React.useEffect(() => {
    // Store function in a way parent can access it
    ;(window as any)._getClientPendingAnnexes = getPendingAnnexesForUpload
    ;(window as any)._clearClientPendingAnnexes = () => {
      pendingAnnexes.forEach((pa) => {
        if (pa.file.preview) {
          URL.revokeObjectURL(pa.file.preview)
        }
      })
      setPendingAnnexes([])
      setNewAnnexName('')
    }

    return () => {
      delete (window as any)._getClientPendingAnnexes
      delete (window as any)._clearClientPendingAnnexes
    }
  }, [getPendingAnnexesForUpload, pendingAnnexes])

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='h-5 w-5' />
          Documentos Anexos
          <span className='text-sm font-normal text-muted-foreground'>
            (Máximo 100MB total)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='annexes'
          render={() => (
            <FormItem>
              {/* Name Input */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Nombre del documento
                </label>
                <Input
                  placeholder='Ej: Identificación, Contrato, etc.'
                  value={newAnnexName}
                  onChange={(e) => setNewAnnexName(e.target.value)}
                  className='w-full'
                />
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                } ${!newAnnexName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  disabled={!newAnnexName.trim()}
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
                {!newAnnexName.trim() && (
                  <p className='text-xs text-destructive mt-2'>
                    Ingresa un nombre para el documento antes de seleccionar
                    archivos
                  </p>
                )}
              </div>

              {/* Size indicator */}
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Total: {formatFileSize(getTotalSize())}</span>
                <span>Límite: 100MB</span>
              </div>

              {/* Existing Annexes */}
              {currentAnnexes.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>Documentos Actuales</h4>
                  {currentAnnexes.map((annex, index) => (
                    <AnnexPreview
                      key={`existing-${index}`}
                      annex={annex}
                      onRemove={() => removeExistingAnnex(index)}
                      isExisting
                    />
                  ))}
                </div>
              )}

              {/* Pending Annexes */}
              {pendingAnnexes.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>Documentos Nuevos</h4>
                  {pendingAnnexes.map((pendingAnnex, index) => (
                    <PendingAnnexPreview
                      key={`pending-${index}`}
                      pendingAnnex={pendingAnnex}
                      onRemove={() => removePendingAnnex(index)}
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

// Component for existing annex preview
function AnnexPreview({
  annex,
  onRemove,
  isExisting,
}: {
  annex: Annex
  onRemove: () => void
  isExisting?: boolean
}) {
  return (
    <div className='flex items-center justify-between p-3 border rounded-lg'>
      <div className='flex items-center gap-3'>
        {getFileIcon(annex.media.type)}
        <div>
          <p className='font-medium text-sm'>{annex.name}</p>
          <div className='flex items-center gap-2'>
            {annex.media.mimetype && (
              <span className='text-xs text-muted-foreground'>
                {annex.media.mimetype}
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

// Component for pending annex preview
function PendingAnnexPreview({
  pendingAnnex,
  onRemove,
}: {
  pendingAnnex: PendingAnnex
  onRemove: () => void
}) {
  const { file, name, type, error } = pendingAnnex

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
          <p className='font-medium text-sm'>{name}</p>
          <p className='text-xs text-muted-foreground'>{file.name}</p>
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

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, Upload, X } from "lucide-react"
import * as React from "react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

interface FileWithPreview {
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
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
  },
  onChange,
  value,
}: FileUploadProps) {
  const [previews, setPreviews] = useState<FileWithPreview[]>([])

  // Actualizar previews cuando cambia value
  React.useEffect(() => {
    if (value) {
      const newPreviews = value.map(file => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file)
      }))
      setPreviews(prev => {
        // Limpiar URLs antiguos
        prev.forEach(p => URL.revokeObjectURL(p.preview))
        return newPreviews
      })
    }
  }, [value])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (previews.length + acceptedFiles.length > maxFiles) {
        toast.error(`Solo puedes subir ${maxFiles} archivos`)
        return
      }

      const newPreviews = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file)
      }))

      setPreviews(prev => [...prev, ...newPreviews])
      onChange?.(acceptedFiles)
    },
    [maxFiles, onChange, previews.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  })

  const removeFile = useCallback((id: string) => {
    setPreviews((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
        onChange?.(prev.filter(f => f.id !== id).map(f => f.file))
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [onChange])

  // Limpiar URLs al desmontar
  React.useEffect(() => {
    return () => {
      previews.forEach(file => {
        URL.revokeObjectURL(file.preview)
      })
    }
  }, [previews])

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 sm:p-8 transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        )}
      >
        <input {...getInputProps()} aria-label="File upload" />
        <div className="text-center cursor-pointer">
          <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-medium">
            Arrastra archivos aquí o selecciona
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, GIF hasta {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {previews.map((file) => (
            <div key={file.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-background">
              <img
                src={file.preview}
                alt={file.file.name}
                className="h-full w-full cursor-pointer object-cover transition-all hover:opacity-80"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/80 p-2.5 backdrop-blur transition-all">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
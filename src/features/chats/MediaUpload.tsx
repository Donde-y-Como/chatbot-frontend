import React, { useRef, useState } from 'react'
import { FileText, Paperclip, Send, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useUploadMedia } from '@/features/chats/hooks/useUploadMedia.ts'
import type { OutgoingMedia } from '@/features/chats/ChatTypes'

interface MediaUploadProps {
  onSend: (media: OutgoingMedia) => void
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onSend }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, validateFile, isUploading, progress } = useUploadMedia()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { isValid, type } = validateFile(file)
    if (!isValid) {
      alert('Tipo de archivo no permitido')
      return
    }

    setSelectedFile(file)
    setCaption('')
    if (type === 'image' || type === 'video') {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
    setIsOpen(true)
  }

  const handleSend = async () => {
    if (!selectedFile) return

    const { type } = validateFile(selectedFile)
    if (!type) return

    try {
      const url = await uploadFile(selectedFile)

      onSend({
        type,
        url,
        caption: caption.trim() ? caption.trim() : undefined,
        filename: selectedFile.name,
        mimetype: selectedFile.type,
      })
      handleClear()
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        variant: 'destructive',
        title: 'El archivo no se subió correctamente',
      })
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setIsOpen(false)
    setCaption('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        className='hidden'
        accept='.pdf,.txt,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4'
      />

      <Button
        variant='ghost'
        size='sm'
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className='h-5 w-5' />
      </Button>

      {selectedFile && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className='max-w-4xl bg-background p-6'>
            <DialogTitle>Vista previa</DialogTitle>
            <DialogDescription className='sr-only'>
              Ver vista previa del archivo
            </DialogDescription>
            <div className='relative flex items-center justify-center'>
              {preview ? (
                validateFile(selectedFile).type === 'image' ? (
                  <img
                    src={preview}
                    alt='Preview'
                    className='max-w-full max-h-[70vh] object-contain rounded-lg'
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className='max-w-full max-h-[70vh] rounded-lg'
                  />
                )
              ) : (
                <div className='flex flex-col items-center justify-center gap-2 p-6 border rounded-lg bg-muted/30 w-full'>
                  <FileText className='h-10 w-10 text-muted-foreground' />
                  <p className='text-foreground break-all text-center'>
                    {selectedFile.name}
                  </p>
                </div>
              )}
              {isUploading && (
                <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center'>
                  <Progress value={progress} className='w-1/2 mb-2' />
                  <p className='text-sm text-foreground'>{progress}%</p>
                </div>
              )}
            </div>

            <div className='mt-4 grid gap-2'>
              <div className='grid gap-1.5'>
                <Label htmlFor='mediaCaption'>Texto para la imagen (opcional)</Label>
                <Input
                  id='mediaCaption'
                  placeholder='Texto para la imagen…'
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <Button variant='ghost' onClick={handleClear}>
                <X className='h-4 w-4 mr-2' />
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={isUploading}
                id='sendMediaButton'
              >
                <Send className='h-4 w-4 mr-2' />
                Enviar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
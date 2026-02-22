import React, { useCallback, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useMutation } from '@tanstack/react-query'
import { FileText, Paperclip, Send, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { chatService } from '@/features/chats/ChatService'
import { useUploadMedia } from '@/features/chats/hooks/useUploadMedia'
import { PhoneNumberSelector } from '@/features/chats/components/PhoneNumberSelector'
import type { OutgoingMedia } from '@/features/chats/ChatTypes'
import { queryClient } from '../../hooks/use-web-socket'

type PendingFile = {
  file: File
  preview: string | null
  caption: string
  type: OutgoingMedia['type']
}

export const BulkSendWhatsappWeb: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, validateFile, isUploading, progress } = useUploadMedia()

  const resetForm = useCallback(() => {
    setPhoneNumbers([])
    setContent('')
    setPendingFiles([])
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    resetForm()
  }, [resetForm])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const newPending: PendingFile[] = []
    for (const file of files) {
      const { isValid, type } = validateFile(file)
      if (!isValid || !type) {
        toast.error(`Tipo de archivo no permitido: ${file.name}`)
        continue
      }
      const preview =
        type === 'image' || type === 'video' ? URL.createObjectURL(file) : null
      newPending.push({ file, preview, caption: '', type })
    }

    setPendingFiles((prev) => [...prev, ...newPending])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setPendingFiles((prev) => {
      const copy = [...prev]
      const removed = copy.splice(index, 1)[0]
      if (removed.preview) URL.revokeObjectURL(removed.preview)
      return copy
    })
  }

  const updateCaption = (index: number, caption: string) => {
    setPendingFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, caption } : f))
    )
  }

  const bulkSendMutation = useMutation({
    mutationKey: ['bulk-send-whatsapp-web'],
    mutationFn: async () => {
      const medias: OutgoingMedia[] = []
      for (const pending of pendingFiles) {
        const url = await uploadFile(pending.file)
        medias.push({
          url,
          type: pending.type,
          caption: pending.caption.trim() || undefined,
          filename: pending.file.name,
          mimetype: pending.file.type,
        })
      }
      await chatService.bulkSendWhatsappWeb({ phoneNumbers, content, medias })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['chats']})
      toast.success('Mensajes enviados correctamente')
      handleClose()
    },
    onError: () => {
      toast.error('Error al enviar los mensajes')
    },
  })

  const isValid = phoneNumbers.length > 0 && content.trim().length > 0
  const isSending = bulkSendMutation.isPending || isUploading

  const formContent = (
    <div className='space-y-5 p-4'>
      {/* Phone number selector */}
      <PhoneNumberSelector value={phoneNumbers} onChange={setPhoneNumbers} />

      {/* Message */}
      <div className='space-y-1.5'>
        <Label htmlFor='bulk-content'>Mensaje</Label>
        <Textarea
          id='bulk-content'
          placeholder='Escribe el mensaje que recibirán todos los destinatarios…'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
      </div>

      {/* Attached files */}
      {pendingFiles.length > 0 && (
        <div className='space-y-2'>
          <Label>Archivos adjuntos</Label>
          {pendingFiles.map((pf, i) => (
            <div
              key={i}
              className='flex items-start gap-3 rounded-md border p-3 bg-muted/30'
            >
              {pf.preview ? (
                pf.type === 'image' ? (
                  <img
                    src={pf.preview}
                    alt={pf.file.name}
                    className='h-16 w-16 object-cover rounded'
                  />
                ) : (
                  <video src={pf.preview} className='h-16 w-16 object-cover rounded' />
                )
              ) : (
                <div className='flex h-16 w-16 items-center justify-center rounded bg-muted'>
                  <FileText className='h-8 w-8 text-muted-foreground' />
                </div>
              )}
              <div className='flex-1 min-w-0 space-y-1'>
                <p className='text-xs text-muted-foreground truncate'>{pf.file.name}</p>
                <Input
                  placeholder='Texto de la imagen (opcional)'
                  value={pf.caption}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  className='h-7 text-xs'
                />
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 shrink-0'
                onClick={() => removeFile(i)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className='space-y-1'>
          <Progress value={progress} />
          <p className='text-xs text-center text-muted-foreground'>
            Subiendo archivo… {progress}%
          </p>
        </div>
      )}

      <div className='flex items-center justify-between gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
        >
          <Paperclip className='h-4 w-4 mr-1' />
          Adjuntar archivo
        </Button>

        <div className='flex items-center gap-2'>
          <DialogClose asChild>
            <Button variant='ghost' onClick={handleClose} disabled={isSending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={() => bulkSendMutation.mutate()}
            disabled={!isValid || isSending}
          >
            <Send className='h-4 w-4 mr-1' />
            {isSending
              ? 'Enviando…'
              : `Enviar a ${phoneNumbers.length > 0 ? phoneNumbers.length : '…'}`}
          </Button>
        </div>
      </div>

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        className='hidden'
        accept='.pdf,.txt,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4'
        multiple
      />
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} modal shouldScaleBackground>
        <DrawerTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setIsOpen(true)}
            title='Envío masivo WhatsApp Web'
          >
            <Users className='h-4 w-4' />
          </Button>
        </DrawerTrigger>
        <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <DrawerHeader>
            <DrawerTitle>Envío masivo WhatsApp Web</DrawerTitle>
            <DrawerDescription>
              Envía un mensaje a múltiples contactos de WhatsApp Web a la vez.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className='h-[80vh]'>{formContent}</ScrollArea>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          onClick={() => setIsOpen(true)}
          title='Envío masivo WhatsApp Web'
        >
          <Users className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent
        className='max-w-2xl'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Envío masivo WhatsApp Web</DialogTitle>
          <DialogDescription>
            Envía un mensaje a múltiples contactos de WhatsApp Web a la vez.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[80vh]'>{formContent}</ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

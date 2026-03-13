import React, { useCallback, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useMutation } from '@tanstack/react-query'
import { FileText, Paperclip, Send, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
      await queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success('Mensajes enviados correctamente')
      handleClose()
    },
    onError: () => {
      toast.error('Error al enviar los mensajes')
    },
  })

  const isValid = phoneNumbers.length > 0 && content.trim().length > 0
  const isSending = bulkSendMutation.isPending || isUploading

  const formBody = (
    <div className='grid grid-cols-1 md:grid-cols-[1.2fr_1fr] md:divide-x h-full'>
      {/* Left Column: Recipients + Message */}
      <div className='flex flex-col space-y-6 p-6'>
        {/* Phone number selector */}
        <PhoneNumberSelector value={phoneNumbers} onChange={setPhoneNumbers} />

        {/* Message */}
        <div className='space-y-2 flex-1 flex flex-col'>
          <Label htmlFor='bulk-content'>Mensaje</Label>
          <Textarea
            id='bulk-content'
            placeholder='Escribe el mensaje que recibirán todos los destinatarios…'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='flex-1 min-h-[150px] resize-none'
          />
        </div>
      </div>

      {/* Right Column: Attachments & Status */}
      <div className='flex flex-col p-6 bg-muted/10'>
        <div className='flex items-center justify-between mb-4'>
          <Label>Archivos adjuntos</Label>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Paperclip className='h-4 w-4 mr-2' />
            Adjuntar
          </Button>
        </div>

        <ScrollArea className='flex-1 -mx-2 px-2'>
          <div className='space-y-3 pb-4'>
            {pendingFiles.length === 0 && !isUploading && (
              <div className='text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg'>
                No hay archivos adjuntos
              </div>
            )}

            {pendingFiles.map((pf, i) => (
              <div
                key={i}
                className='flex items-start gap-3 rounded-md border p-3 bg-background shadow-sm'
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
                <div className='flex-1 min-w-0 space-y-1.5'>
                  <p className='text-xs font-medium text-foreground truncate'>{pf.file.name}</p>
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

            {isUploading && (
              <div className='space-y-2 p-3 border rounded-md bg-background shadow-sm'>
                <Progress value={progress} className='h-2' />
                <p className='text-xs text-center text-muted-foreground'>
                  Subiendo archivo… {progress}%
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Summary Card */}
        <div className='mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2 shrink-0'>
          <h4 className='text-sm font-medium'>Resumen</h4>
          <div className='text-sm text-muted-foreground flex justify-between'>
            <span>Destinatarios:</span>
            <span className='font-medium text-foreground'>{phoneNumbers.length}</span>
          </div>
          <div className='text-sm text-muted-foreground flex justify-between'>
            <span>Archivos adjuntos:</span>
            <span className='font-medium text-foreground'>{pendingFiles.length}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const formFooter = (
    <div className='flex items-center justify-between gap-4'>
      {/* Readiness Indicator */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        {isValid ? (
          <>
            <span className='relative flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
            </span>
            <span className='text-emerald-600 font-medium'>Listo para enviar</span>
          </>
        ) : (
          <>
            <span className='h-3 w-3 rounded-sm bg-muted-foreground/30'></span>
            <span>Completar campos requeridos</span>
          </>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <Button type='button' variant='ghost' onClick={handleClose} disabled={isSending}>
          Cancelar
        </Button>
        <Button onClick={() => bulkSendMutation.mutate()} disabled={!isValid || isSending}>
          {isSending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando…
            </>
          ) : (
            <>
              <Send className='h-4 w-4 mr-2' />
              {`Enviar a ${phoneNumbers.length > 0 ? phoneNumbers.length : '…'}`}
            </>
          )}
        </Button>
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
        <DrawerContent className="p-0 gap-0" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className='flex h-[90vh] flex-col'>
            <DrawerHeader className='px-6 py-4 border-b shrink-0 text-left'>
              <DrawerTitle>Envío masivo WhatsApp Web</DrawerTitle>
              <DrawerDescription>
                Envía un mensaje a múltiples contactos de WhatsApp Web a la vez.
              </DrawerDescription>
            </DrawerHeader>

            <ScrollArea className='flex-1 min-h-0'>{formBody}</ScrollArea>

            <div className='border-t px-6 py-4 shrink-0 bg-muted/20'>
              {formFooter}
            </div>
          </div>
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
        className='w-[95vw] max-w-5xl h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='px-6 py-4 border-b shrink-0'>
          <DialogTitle>Envío masivo WhatsApp Web</DialogTitle>
          <DialogDescription>
            Envía un mensaje a múltiples contactos de WhatsApp Web a la vez.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 min-h-0 overflow-y-auto md:overflow-hidden'>
          {formBody}
        </div>

        <div className='border-t px-6 py-4 shrink-0 bg-muted/20'>
          {formFooter}
        </div>
      </DialogContent>
    </Dialog>
  )
}

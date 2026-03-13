import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useMutation, useQuery } from '@tanstack/react-query'
import { FileText, Paperclip, Send, Users, X, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { extractWhatsAppWebPhone } from '@/features/chats/components/PhoneNumberSelector'
import { useGetConversationStatuses } from '@/features/chats/conversationStatus/hooks/useConversationStatus'
import type { OutgoingMedia, Chat } from '@/features/chats/ChatTypes'
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
  const [step, setStep] = useState<1 | 2>(1)
  
  const [globalSearch, setGlobalSearch] = useState('')
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([])
  
  const [content, setContent] = useState('')
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { uploadFile, validateFile, isUploading, progress } = useUploadMedia()
  const { data: statuses } = useGetConversationStatuses()

  // Fetch all chats only when open to avoid background polling limits on large sets
  const { data: chats = [], isLoading: isChatsLoading } = useQuery({
    queryKey: ['bulk-chats-all'],
    queryFn: () => chatService.getChats(),
    enabled: isOpen,
  })

  const resetForm = useCallback(() => {
    setStep(1)
    setPhoneNumbers([])
    setContent('')
    setPendingFiles([])
    setGlobalSearch('')
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    resetForm()
  }, [resetForm])

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

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

  const isSending = bulkSendMutation.isPending

  // --- Step 1: Filters and Selection Handlers ---
  const validChats = useMemo(() => {
    const lowerSearch = globalSearch.toLowerCase()
    return chats.filter((chat) => {
      if (!chat.client) return false
      const phone = extractWhatsAppWebPhone(chat.client)
      if (!phone) return false
      
      if (lowerSearch) {
        const matchName = chat.client.name.toLowerCase().includes(lowerSearch)
        const matchPhone = phone.includes(lowerSearch)
        if (!matchName && !matchPhone) return false
      }
      return true
    })
  }, [chats, globalSearch])

  const chatsByStatus = useMemo(() => {
    const grouped: Record<string, Chat[]> = {}
    if (statuses) {
      statuses.forEach((s) => (grouped[s.id] = []))
    }
    validChats.forEach((chat) => {
      if (chat.status?.id && grouped[chat.status.id]) {
        grouped[chat.status.id].push(chat)
      } else {
        // Option to put them in "Unassigned" if needed, but let's stick to mapped statuses
      }
    })
    return grouped
  }, [validChats, statuses])

  const toggleSingleSelection = (phone: string) => {
    setPhoneNumbers((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    )
  }

  const toggleColumnSelection = (statusId: string, isChecked: boolean) => {
    const colChats = chatsByStatus[statusId] || []
    const colPhones = colChats
      .map((c) => extractWhatsAppWebPhone(c.client!))
      .filter(Boolean) as string[]

    setPhoneNumbers((prev) => {
      if (isChecked) {
        const combined = new Set([...prev, ...colPhones])
        return Array.from(combined)
      } else {
        const toRemove = new Set(colPhones)
        return prev.filter((p) => !toRemove.has(p))
      }
    })
  }

  const step1Content = (
    <div className='flex flex-col h-full bg-muted/5'>
      <div className='p-4 border-b shrink-0 flex items-center justify-between gap-4'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre o número...'
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <div className='text-sm text-muted-foreground font-medium whitespace-nowrap'>
          {validChats.length} clientes encontrados
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex gap-4 p-4 min-h-full'>
            {isChatsLoading && (
              <div className='flex gap-4'>
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className='w-72 bg-muted/20 animate-pulse rounded-lg border h-[400px]'></div>
                ))}
              </div>
            )}
            
            {!isChatsLoading && statuses?.map((status) => {
              const columnChats = chatsByStatus[status.id] || []
              const allChecked =
                columnChats.length > 0 &&
                columnChats.every((c) => {
                  const p = extractWhatsAppWebPhone(c.client!)
                  return p && phoneNumbers.includes(p)
                })

              return (
                <div key={status.id} className='w-[300px] flex-shrink-0 flex flex-col bg-muted/20 border rounded-lg overflow-hidden'>
                  {/* Header */}
                  <div className='p-3 border-b bg-background flex items-center justify-between shrink-0'
                       style={{ borderTop: `4px solid ${status.color || '#ccc'}` }}>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm truncate'>{status.name}</span>
                      <span className='rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground font-medium'>
                        {columnChats.length}
                      </span>
                    </div>
                    {columnChats.length > 0 && (
                      <Checkbox
                        checked={allChecked}
                        onCheckedChange={(checked) => toggleColumnSelection(status.id, !!checked)}
                        title='Seleccionar todos'
                      />
                    )}
                  </div>
                  
                  {/* Column Body */}
                  <ScrollArea className='flex-1 h-[450px] p-3'>
                    <div className='space-y-3'>
                      {columnChats.length === 0 ? (
                        <p className='text-xs text-center text-muted-foreground mt-10'>Sin clientes</p>
                      ) : (
                        columnChats.map((chat) => {
                          const phone = extractWhatsAppWebPhone(chat.client!)!
                          const isSelected = phoneNumbers.includes(phone)
                          return (
                            <div key={chat.id} className={`flex items-center gap-3 p-3 rounded-lg border bg-background transition-shadow hover:shadow-sm ${isSelected ? 'ring-1 ring-primary border-primary/50' : ''}`}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSingleSelection(phone)}
                              />
                              <Avatar className='h-8 w-8 shrink-0'>
                                <AvatarImage src={chat.client?.photo} />
                                <AvatarFallback className='text-xs bg-primary/10 text-primary'>
                                  {chat.client?.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium truncate'>{chat.client?.name}</p>
                                <p className='text-xs text-muted-foreground font-mono truncate'>
                                  {phone}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  // --- Step 2: Message Composer ---
  const step2Content = (
    <div className='grid grid-cols-1 md:grid-cols-[1.2fr_1fr] md:divide-x h-full'>
      {/* Left Column: Message */}
      <div className='flex flex-col space-y-6 p-6'>
        <div className='space-y-2 flex-1 flex flex-col'>
          <Label htmlFor='bulk-content'>Escribe tu mensaje</Label>
          <Textarea
            id='bulk-content'
            placeholder={`Hola, te escribo para...`}
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
              <div className='text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg bg-background/50'>
                No hay archivos
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
            <span>Destinatarios seleccionados:</span>
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

  const isValidStep2 = content.trim().length > 0
  const isActionDisabled = isSending

  const formFooter = (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 w-full'>
      {step === 1 ? (
        <>
          <div className='text-sm text-muted-foreground font-medium'>
            {phoneNumbers.length} seleccionado{phoneNumbers.length !== 1 ? 's' : ''}
          </div>
          <div className='flex gap-2 w-full sm:w-auto'>
            <Button type='button' variant='ghost' onClick={handleClose} className='flex-1 sm:flex-none'>
              Cancelar
            </Button>
            <Button type='button' onClick={() => setStep(2)} disabled={phoneNumbers.length === 0} className='flex-1 sm:flex-none'>
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            {isValidStep2 ? (
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
                 <span>Escribe un mensaje</span>
               </>
            )}
          </div>
          <div className='flex gap-2 w-full sm:w-auto'>
            <Button type='button' variant='outline' onClick={() => setStep(1)} disabled={isSending}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
            </Button>
            <Button onClick={() => bulkSendMutation.mutate()} disabled={!isValidStep2 || isActionDisabled}>
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
                  <Send className='h-4 w-4 mr-2' /> Enviar mensaje
                </>
              )}
            </Button>
          </div>
        </>
      )}
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

  const headerTitle = step === 1 ? 'Selecciona los destinatarios (1/2)' : 'Escribe tu mensaje (2/2)'

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
          <div className='flex h-[90vh] flex-col overflow-hidden'>
            <DrawerHeader className='px-6 py-4 border-b shrink-0 text-left bg-background'>
              <DrawerTitle>{headerTitle}</DrawerTitle>
              <DrawerDescription>
                Envío masivo de WhatsApp Web
              </DrawerDescription>
            </DrawerHeader>

            <div className='flex-1 min-h-0 overflow-y-auto'>
              {step === 1 ? step1Content : step2Content}
            </div>

            <div className='border-t px-6 py-4 shrink-0 bg-background'>
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
        className='w-[95vw] max-w-6xl h-[90vh] md:h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='px-6 py-4 border-b shrink-0'>
          <DialogTitle>{headerTitle}</DialogTitle>
          <DialogDescription>
             Envío masivo de WhatsApp Web
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 min-h-0 overflow-hidden'>
          {step === 1 ? step1Content : step2Content}
        </div>

        <div className='border-t px-6 py-4 shrink-0 bg-muted/20'>
          {formFooter}
        </div>
      </DialogContent>
    </Dialog>
  )
}

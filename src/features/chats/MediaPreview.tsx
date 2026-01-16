import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ExternalLink,
  File,
  FileAudio,
  FileText,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  MoreVertical,
  Minimize2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Media } from '@/features/chats/ChatTypes.ts'

interface MediaProps {
  media: Media
  triggerClassName?: string
}

interface LoadingState {
  isLoading: boolean
  error: string | null
}

type Point = { x: number; y: number }

type ZoomableImageHandle = {
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

function clampMin(value: number, min: number) {
  return value < min ? min : value
}

const ZoomableImage = React.forwardRef<
  ZoomableImageHandle,
  {
    src: string
    alt: string
    isFullscreen: boolean
  }
>(function ZoomableImage({ src, alt, isFullscreen }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{ start: Point; base: Point } | null>(null)

  const reset = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const zoomBy = useCallback((factor: number) => {
    // No max ("no limits"), only prevent scale from reaching 0.
    setScale((prev) => clampMin(prev * factor, 0.01))
  }, [])

  useEffect(() => {
    // Reset zoom when toggling fullscreen for predictable UX.
    reset()
  }, [isFullscreen, reset])

  React.useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomBy(1.25),
      zoomOut: () => zoomBy(0.8),
      reset,
    }),
    [reset, zoomBy]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || (e.key === '=' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        zoomBy(1.25)
      }
      if (e.key === '-' || (e.key === '_' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        zoomBy(0.8)
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        reset()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [reset, zoomBy])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // React registers wheel listeners as passive in some environments.
      // Use a native non-passive listener so we can prevent page scrolling while zooming.
      e.preventDefault()

      const intensity = 0.002
      const factor = Math.exp(-e.deltaY * intensity)
      setScale((prev) => clampMin(prev * factor, 0.01))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={containerRef}
      className='relative isolate h-full w-full overflow-hidden bg-black/5 touch-none'
      onPointerDown={(e) => {
        // Pan
        if (e.button !== 0) return
        ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        setIsPanning(true)
        panStartRef.current = {
          start: { x: e.clientX, y: e.clientY },
          base: translate,
        }
      }}
      onPointerMove={(e) => {
        if (!isPanning || !panStartRef.current) return
        const dx = e.clientX - panStartRef.current.start.x
        const dy = e.clientY - panStartRef.current.start.y
        setTranslate({
          x: panStartRef.current.base.x + dx,
          y: panStartRef.current.base.y + dy,
        })
      }}
      onPointerUp={() => {
        setIsPanning(false)
        panStartRef.current = null
      }}
      onPointerCancel={() => {
        setIsPanning(false)
        panStartRef.current = null
      }}
    >
      <div className='absolute inset-0 flex items-center justify-center'>
        <img
          src={src}
          alt={alt}
          draggable={false}
          className='select-none max-h-full max-w-full object-contain'
          style={{
            transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  )
})

export const MediaPreview: React.FC<MediaProps> = ({ media, triggerClassName }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [thumb, setThumb] = useState<LoadingState>({ isLoading: true, error: null })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const zoomRef = useRef<ZoomableImageHandle | null>(null)

  const inferredFilename = useMemo(() => {
    if (media.filename) return media.filename

    const mimetype = (media.mimetype || '').toLowerCase()
    const extFromMime = (() => {
      if (mimetype === 'application/pdf') return '.pdf'
      if (mimetype === 'text/plain') return '.txt'
      if (mimetype === 'application/vnd.ms-excel') return '.xls'
      if (
        mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
        return '.xlsx'
      if (mimetype === 'application/msword') return '.doc'
      if (
        mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
        return '.docx'
      if (mimetype === 'application/vnd.ms-powerpoint') return '.ppt'
      if (
        mimetype ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      )
        return '.pptx'
      if (mimetype === 'video/mp4') return '.mp4'
      if (mimetype === 'image/png') return '.png'
      if (mimetype === 'image/jpg' || mimetype === 'image/jpeg') return '.jpg'
      return ''
    })()

    const fromUrl = (() => {
      try {
        const url = new URL(media.url)
        const last = url.pathname.split('/').filter(Boolean).pop()
        return last ? decodeURIComponent(last) : 'archivo'
      } catch {
        const last = media.url.split('/').pop()
        return last || 'archivo'
      }
    })()

    if (fromUrl.includes('.')) return fromUrl
    return `${fromUrl}${extFromMime}`
  }, [media.filename, media.mimetype, media.url])

  const mediaWithFilename = useMemo(() => {
    return { ...media, filename: inferredFilename }
  }, [inferredFilename, media])

  const displayName = useMemo(() => {
    return mediaWithFilename.filename || 'archivo'
  }, [mediaWithFilename.filename])

  const mediaKind = useMemo(() => {
    const type = (mediaWithFilename.type || '').toLowerCase()
    const mimetype = (mediaWithFilename.mimetype || '').toLowerCase()

    const isImage =
      type.includes('image') ||
      type.includes('imagemessage') ||
      type.includes('sticker') ||
      mimetype.startsWith('image/')
    const isVideo = type.includes('video') || mimetype.startsWith('video/')
    const isAudio = type.includes('audio') || mimetype.startsWith('audio/')
    const isDocument =
      type.includes('document') ||
      type.includes('pdf') ||
      mimetype === 'application/pdf' ||
      mimetype.startsWith('application/')

    if (isImage) return 'image'
    if (isVideo) return 'video'
    if (isAudio) return 'audio'
    if (isDocument) return 'document'
    return 'unknown'
  }, [mediaWithFilename.mimetype, mediaWithFilename.type])

  const handleThumbLoad = useCallback(() => {
    setThumb({ isLoading: false, error: null })
  }, [])

  const handleThumbError = useCallback(() => {
    setThumb({ isLoading: false, error: 'Error al cargar vista previa' })
  }, [])

  const InlineIcon = useMemo(() => {
    switch (mediaKind) {
      case 'image':
        return ImageIcon
      case 'video':
        return Video
      case 'audio':
        return FileAudio
      case 'document':
        return FileText
      default:
        return File
    }
  }, [mediaKind])

  const DialogBody = () => {
    if (mediaKind === 'image') {
      return (
        <div className={cn('relative', isFullscreen ? 'h-[calc(100vh-56px)]' : 'h-[70vh]')}>
          <ZoomableImage
            ref={zoomRef}
            src={media.url}
            alt={media.caption || 'Imagen'}
            isFullscreen={isFullscreen}
          />
        </div>
      )
    }

    if (mediaKind === 'video') {
      return (
        <div className='bg-black/5 p-2 sm:p-4'>
          <video
            controls
            preload='metadata'
            className='w-full max-h-[78vh] rounded-lg bg-black'
          >
            <source src={media.url} type={media.mimetype || 'video/mp4'} />
            <p>Tu navegador no soporta la reproducción de video.</p>
          </video>
        </div>
      )
    }

    if (mediaKind === 'audio') {
      return (
        <div className='p-6'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <FileAudio className='h-4 w-4' />
            Audio
          </div>
          <div className='mt-4'>
            <audio controls preload='metadata' className='w-full'>
              <source src={media.url} type={media.mimetype || 'audio/mpeg'} />
              <p>Tu navegador no soporta la reproducción de audio.</p>
            </audio>
          </div>
        </div>
      )
    }

    if (mediaKind === 'document') {
      return (
        <div className='p-6'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <FileText className='h-4 w-4' />
            Documento
          </div>
          <p className='mt-2 text-sm text-muted-foreground break-words'>
            {displayName}
          </p>
          {media.caption && (
            <div className='mt-4 rounded-lg border bg-muted/30 p-3 text-sm'>
              {media.caption}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className='flex flex-col items-center justify-center gap-2 p-10 text-muted-foreground'>
        <AlertCircle className='h-10 w-10' />
        <p className='text-sm text-center'>Vista previa no disponible</p>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            'group cursor-pointer rounded-xl border bg-background/60 overflow-hidden shadow-sm transition hover:shadow-md',
            mediaKind === 'image' || mediaKind === 'video'
              ? 'w-[220px] sm:w-[260px]'
              : 'max-w-[240px] sm:max-w-[280px]',
            mediaKind === 'image' || mediaKind === 'video' ? '' : 'p-3',
            mediaKind !== 'image' && mediaKind !== 'video' && 'flex items-center gap-3',
            mediaKind === 'image' || mediaKind === 'video' ? 'p-0' : '',
            triggerClassName
          )}
        >
          {(mediaKind === 'image' || mediaKind === 'video') && (
            <div className='relative h-40 sm:h-48 w-full bg-muted'>
              {mediaKind === 'image' ? (
                <>
                  {thumb.isLoading && (
                    <div className='absolute inset-0 grid place-items-center'>
                      <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                    </div>
                  )}
                  {thumb.error ? (
                    <div className='absolute inset-0 grid place-items-center text-muted-foreground'>
                      <AlertCircle className='h-5 w-5' />
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={media.caption || 'Vista previa'}
                      className='h-full w-full object-cover'
                      onLoad={handleThumbLoad}
                      onError={handleThumbError}
                      style={{ display: thumb.isLoading ? 'none' : 'block' }}
                    />
                  )}
                </>
              ) : (
                <>
                  <video
                    muted
                    preload='metadata'
                    className='h-full w-full object-cover'
                    onLoadedData={handleThumbLoad}
                    onError={handleThumbError}
                  >
                    <source src={media.url} type={media.mimetype || 'video/mp4'} />
                  </video>
                  <div className='absolute inset-0 grid place-items-center bg-black/30'>
                    <div className='flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow'>
                      <Play className='h-3.5 w-3.5' />
                      Video
                    </div>
                  </div>
                </>
              )}

              {media.caption && (
                <div className='absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2'>
                  <p className='text-xs text-white truncate'>{media.caption}</p>
                </div>
              )}
            </div>
          )}

          {mediaKind !== 'image' && mediaKind !== 'video' && (
            <>
              <div className='grid h-9 w-9 place-items-center rounded-lg bg-muted'>
                <InlineIcon className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='text-sm font-medium truncate'>{displayName}</div>
                {media.caption ? (
                  <div className='text-xs text-muted-foreground truncate'>
                    {media.caption}
                  </div>
                ) : (
                  <div className='text-xs text-muted-foreground capitalize'>
                    {mediaKind === 'audio'
                      ? 'Audio'
                      : mediaKind === 'document'
                        ? 'Documento'
                        : 'Archivo'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'bg-background p-0 overflow-hidden',
          isFullscreen ? 'max-w-none w-[100vw] h-[100vh] sm:rounded-none' : 'max-w-5xl'
        )}
      >
        <DialogTitle className='sr-only'>Vista previa: {displayName}</DialogTitle>
        <DialogDescription className='sr-only'>
          {media.caption ? media.caption : 'Vista previa de archivo'}
        </DialogDescription>

        <div className='flex items-center justify-between gap-3 border-b px-4 py-3'>
          <div className='min-w-0'>
            <div className='text-sm font-semibold truncate'>{displayName}</div>
            <div className='text-xs text-muted-foreground capitalize'>
              {mediaKind === 'image'
                ? 'Imagen'
                : mediaKind === 'video'
                  ? 'Video'
                  : mediaKind === 'audio'
                    ? 'Audio'
                    : mediaKind === 'document'
                      ? 'Documento'
                      : 'Archivo'}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* Mobile: collapse actions into a menu to avoid header overflow */}
            <div className='sm:hidden'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size='icon' variant='outline' aria-label='Acciones'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {mediaKind === 'image' && (
                    <>
                      <DropdownMenuItem onClick={() => setIsFullscreen((v) => !v)}>
                        {isFullscreen ? (
                          <>
                            <Minimize2 className='h-4 w-4 mr-2' />
                            Salir de pantalla completa
                          </>
                        ) : (
                          <>
                            <Maximize2 className='h-4 w-4 mr-2' />
                            Pantalla completa
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => zoomRef.current?.zoomOut()}>
                        <Minus className='h-4 w-4 mr-2' />
                        Zoom -
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => zoomRef.current?.zoomIn()}>
                        <Plus className='h-4 w-4 mr-2' />
                        Zoom +
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => zoomRef.current?.reset()}>
                        <RotateCcw className='h-4 w-4 mr-2' />
                        Reiniciar zoom
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => window.open(media.url, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className='h-4 w-4 mr-2' />
                    Abrir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop/tablet: keep explicit buttons */}
            <div className='hidden sm:flex items-center gap-2'>
              {mediaKind === 'image' && (
                <>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setIsFullscreen((v) => !v)}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className='h-4 w-4 mr-2' />
                        Salir
                      </>
                    ) : (
                      <>
                        <Maximize2 className='h-4 w-4 mr-2' />
                        Pantalla completa
                      </>
                    )}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => zoomRef.current?.zoomOut()}
                    aria-label='Zoom menos'
                  >
                    <Minus className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => zoomRef.current?.zoomIn()}
                    aria-label='Zoom más'
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => zoomRef.current?.reset()}
                    aria-label='Reiniciar zoom'
                  >
                    <RotateCcw className='h-4 w-4' />
                  </Button>
                </>
              )}
              <Button
                size='sm'
                variant='outline'
                onClick={() => window.open(media.url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                Abrir
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            isFullscreen ? 'h-[calc(100vh-56px)]' : 'max-h-[85vh]',
            mediaKind === 'image' ? 'overflow-hidden' : 'overflow-auto'
          )}
        >
          <DialogBody />

          {media.caption && mediaKind !== 'document' && (
            <div className='border-t p-4'>
              <div className='text-xs text-muted-foreground'>Descripción</div>
              <div className='mt-1 text-sm whitespace-pre-wrap'>{media.caption}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

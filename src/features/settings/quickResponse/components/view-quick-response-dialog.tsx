import { ImageIcon } from '@radix-ui/react-icons'
import {
  Bot,
  File,
  FileAudio,
  FileText,
  Info,
  MessageSquare,
  Smartphone,
  Video,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Media } from '@/features/chats/ChatTypes.ts'
import { QuickResponse } from '@/features/settings/quickResponse/types.ts'

interface ViewQuickResponseDialogProps {
  isOpen: boolean
  onClose: () => void
  data: QuickResponse
}

export function ViewQuickResponseDialog({
  isOpen,
  onClose,
  data,
}: ViewQuickResponseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] h-[90vh] p-0 gap-0 overflow-hidden'>
        <div className='flex flex-col h-full'>
          <DialogHeader className='p-6 pb-2 bg-gradient-to-r from-primary/10 to-primary/5'>
            <DialogTitle className='text-2xl font-bold text-foreground'>
              {data.title}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground'>
              Vista previa de respuesta rápida
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue='message'
            className='flex-1 flex flex-col overflow-hidden'
          >
            <TabsList className='mx-6 my-2 bg-muted'>
              <TabsTrigger
                value='message'
                className='flex items-center gap-1.5'
              >
                <MessageSquare className='w-4 h-4' />
                <span>Mensaje</span>
              </TabsTrigger>
              <TabsTrigger
                value='preview'
                className='flex items-center gap-1.5'
              >
                <Smartphone className='w-4 h-4' />
                <span>Vista Previa</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className='flex-1 p-6 pt-3'>
              <TabsContent value='message' className='mt-0 space-y-6'>
                {/* Message content */}
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <FileText className='w-5 h-5 text-primary' />
                      Contenido del mensaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='prose max-w-none'>
                      <div className='whitespace-pre-wrap text-foreground'>
                        {data.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media content */}
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <ImageIcon className='w-5 h-5 text-primary' />
                      Multimedia
                      {data.medias.length > 0 && (
                        <Badge variant='outline' className='ml-2'>
                          {data.medias.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    {data.medias.length === 0 ? (
                      <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
                        <ImageIcon className='w-12 h-12 mb-3 opacity-20' />
                        <p>Sin archivos multimedia</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {data.medias.map((media, index) => (
                          <MediaCard key={index} media={media} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assistant config */}
                <Card className='border-dashed'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Bot className='w-5 h-5 text-primary' />
                      Configuración del asistente
                      <Badge
                        variant={
                          data.assistantConfig.enabled ? 'default' : 'secondary'
                        }
                        className='ml-2'
                      >
                        {data.assistantConfig.enabled
                          ? 'Habilitado'
                          : 'Deshabilitado'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    {data.assistantConfig.enabled ? (
                      <div className='flex items-start gap-4 p-4 bg-muted/30 rounded-lg'>
                        <div className='bg-primary/10 p-2 rounded-full'>
                          <Info className='w-5 h-5 text-primary' />
                        </div>
                        <div>
                          <h4 className='font-medium mb-1'>Caso de uso</h4>
                          <p className='text-muted-foreground text-sm'>
                            {data.assistantConfig.useCase ||
                              'Sin caso de uso especificado'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center justify-center py-4 text-muted-foreground'>
                        <p>El asistente no utilizará esta respuesta rápida</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='preview' className='mt-0'>
                <ChatPreview data={data} />
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className='p-4 bg-muted/30 border-t'>
            <Button variant='outline' onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MediaCard({ media }: { media: Media }) {
  const getMediaIcon = () => {
    switch ((media.type || '').toLowerCase()) {
      case 'image':
      case 'imagemessage':
        return <ImageIcon className='w-5 h-5' />
      case 'video':
        return <Video className='w-5 h-5' />
      case 'audio':
        return <FileAudio className='w-5 h-5' />
      default:
        return <File className='w-5 h-5' />
    }
  }

  return (
    <Card className='overflow-hidden'>
      <div className='aspect-video bg-muted relative'>
        {(media.type || '').toLowerCase() === 'image' || (media.type || '').toLowerCase() === 'imagemessage' ? (
          <img
            src={media.url || '/placeholder.svg'}
            alt={media.caption || 'Media'}
            className='w-full h-full object-cover'
          />
        ) : (media.type || '').toLowerCase() === 'video' ? (
          <video
            src={media.url}
            controls
            className='w-full h-full object-cover'
          />
        ) : (media.type || '').toLowerCase() === 'audio' ? (
          <div className='flex items-center justify-center h-full bg-primary/10'>
            <audio src={media.url} controls className='w-11/12' />
          </div>
        ) : (
          <div className='flex items-center justify-center h-full bg-primary/10'>
            <File className='w-16 h-16 text-primary/50' />
          </div>
        )}
      </div>
      <CardContent className='p-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            {getMediaIcon()}
            <span className='text-sm font-medium capitalize'>
              {(media.type || '').toLowerCase() === 'image' || (media.type || '').toLowerCase() === 'imagemessage'
                ? 'Foto'
                : (media.type || '').toLowerCase() === 'document'
                  ? 'Documento'
                  : media.type}
            </span>
          </div>
          <a
            href={media.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs underline text-primary hover:underline'
          >
            Ver
          </a>
        </div>
        {media.caption && (
          <p className='mt-2 text-sm text-muted-foreground truncate'>
            {media.caption}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ChatPreview({ data }: { data: QuickResponse }) {
  return (
    <div className='flex flex-col items-center'>
      <div className='w-full max-w-md mx-auto border border-border rounded-3xl overflow-hidden shadow-lg bg-background'>
        {/* Phone header */}
        <div className='bg-primary/10 p-4 flex items-center gap-3 border-b'>
          <Button variant='ghost' size='icon' className='rounded-full'>
            <MessageSquare className='h-5 w-5' />
          </Button>
          <div className='font-medium'>Chat de Ejemplo</div>
        </div>

        <div className='p-4 bg-muted/20 min-h-[400px] flex flex-col gap-4'>
          {/* Incoming message (useCase) - only show if assistant is enabled */}
          {data.assistantConfig.enabled && data.assistantConfig.useCase && (
            <div className='flex items-start gap-2 max-w-[80%]'>
              <Avatar className='h-8 w-8 bg-primary/20'>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className='bg-muted rounded-2xl rounded-tl-sm p-3 text-sm'>
                {data.assistantConfig.useCase}
              </div>
            </div>
          )}

          {/* Outgoing message (content) */}
          <div className='flex flex-col items-end gap-2 ml-auto max-w-[80%]'>
            <div className='bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 text-sm'>
              {data.content}
            </div>

            {/* Media previews */}
            {data.medias.length > 0 && (
              <div className='grid grid-cols-1 gap-2 w-full'>
                {data.medias.map((media, index) => (
                  <div
                    key={index}
                    className='rounded-lg overflow-hidden bg-background border'
                  >
                    {media.type.toLowerCase() === 'image' ? (
                      <img
                        src={media.url || '/placeholder.svg'}
                        alt={media.caption || 'Media'}
                        className='w-full h-32 object-cover'
                      />
                    ) : media.type.toLowerCase() === 'video' ? (
                      <div className='relative bg-black/10 h-32 flex items-center justify-center'>
                        <Video className='h-10 w-10 text-primary/70' />
                      </div>
                    ) : media.type.toLowerCase() === 'audio' ? (
                      <div className='p-3 bg-primary/10 flex items-center gap-2'>
                        <FileAudio className='h-5 w-5' />
                        <span className='text-xs truncate'>
                          {media.caption || 'Audio'}
                        </span>
                      </div>
                    ) : (
                      <div className='p-3 bg-primary/10 flex items-center gap-2'>
                        <File className='h-5 w-5' />
                        <span className='text-xs truncate'>
                          {media.caption || 'Archivo'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { X, Send, Image, Video, FileText, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuickResponse } from '@/features/settings/quickResponse/types'
import { Media } from '@/features/chats/ChatTypes'

interface QuickResponsePreviewProps {
  quickResponse: QuickResponse
  onSend: () => void
  onCancel: () => void
  isLoading?: boolean
}

const MediaIcon = ({ type }: { type: string }) => {
  switch ((type || '').toLowerCase()) {
    case 'image':
    case 'imagemessage':
      return <Image className="h-4 w-4" />
    case 'video':
      return <Video className="h-4 w-4" />
    case 'audio':
      return <Headphones className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const MediaPreviewItem = ({ media }: { media: Media }) => {
  const type = (media.type || '').toLowerCase()
  const isImage = type === 'image' || type === 'imagemessage'
  const isVideo = type === 'video'

  return (
    <div className="relative group">
      {isImage ? (
        <div className="relative">
          <img
            src={media.url}
            alt={media.caption || 'Media preview'}
            className="w-16 h-16 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <MediaIcon type={type} />
          </div>
        </div>
      ) : isVideo ? (
        <div className="relative">
          <video
            src={media.url}
            className="w-16 h-16 object-cover rounded-lg border"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
            <MediaIcon type={type} />
          </div>
        </div>
      ) : (
        <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
          <MediaIcon type={type} />
        </div>
      )}
      
      {media.caption && (
        <p className="text-xs text-muted-foreground mt-1 truncate max-w-16">
          {media.caption}
        </p>
      )}
    </div>
  )
}

export const QuickResponsePreview: React.FC<QuickResponsePreviewProps> = ({
  quickResponse,
  onSend,
  onCancel,
  isLoading = false,
}) => {
  const hasMedia = quickResponse.medias && quickResponse.medias.length > 0

  return (
    <Card className="p-4 mb-2 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {quickResponse.title}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Respuesta rápida
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0"
          disabled={isLoading}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Message Content */}
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-sm whitespace-pre-wrap">
            {quickResponse.content}
          </p>
        </div>

        {/* Media Attachments */}
        {hasMedia && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Archivos adjuntos ({quickResponse.medias.length})
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickResponse.medias.map((media, index) => (
                <MediaPreviewItem key={index} media={media} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={onSend}
          disabled={isLoading}
          className="min-w-20"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { PlatformName } from '../types';
import { chatService } from '@/features/chats/ChatService';
import { Chat } from '@/features/chats/ChatTypes';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { IconBrandWhatsapp, IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformChatButtonProps {
  clientId: string;
  platformName: PlatformName;
  profileName: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  id?: string;
  className?: string;
}

export function PlatformChatButton({ clientId, platformName, profileName, size = 'sm', id, className }: PlatformChatButtonProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Obtener todas las conversaciones
      const conversations = await chatService.getChats();
      
      // Filtrar conversaciones por clientId y platformName
      const filteredChats = conversations.filter(
        chat => chat.client?.id === clientId && chat.platformName === platformName
      );
      
      setChats(filteredChats);
      
      // Si hay una conversación, redirigir automáticamente
      if (filteredChats.length === 1) {
        navigate({ to: '/chats', search: { chatId: filteredChats[0].id } });
        return;
      }
      
      // Si hay múltiples, mostrar el diálogo
      if (filteredChats.length >= 1) {
        setDialogOpen(true);
      } else {
        toast.info(
          `No se encontraron conversaciones para el usuario en ${platformName}`,
          // `No se encontraron conversaciones para ${profileName} en ${platformName}`,
          // {
          //   description: 'El cliente no tiene conversaciones en esta plataforma',
          //   duration: 3000
          // }
        );
      }
    } catch (err) {
      console.error('Error al buscar conversaciones:', err);
      toast.error('Error al buscar conversaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToChat = (chatId: string) => {
    navigate({ to: '/chats', search: { chatId } });
    setDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Renderizar el ícono según la plataforma
  const renderIcon = () => {
    switch (platformName) {
      case PlatformName.Whatsapp:
      case PlatformName.WhatsappWeb:
        return <IconBrandWhatsapp className="h-4 w-4" />;
      case PlatformName.Facebook:
        return <IconBrandFacebook className="h-4 w-4" />;
      case PlatformName.Instagram:
        return <IconBrandInstagram className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        className={`px-2 rounded-full ${className || ''}`}
        id={id}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : renderIcon()}
      </span>

      {/* Diálogo para múltiples conversaciones */}
      {dialogOpen && chats.length > 1 && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Conversaciones de {profileName}</DialogTitle>
              <DialogDescription>
                {platformName} - {profileName}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="mb-4">Selecciona una conversación:</p>
              <div className="space-y-2">
                {chats.map(chat => (
                  <Button 
                    key={chat.id} 
                    onClick={() => handleRedirectToChat(chat.id)} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    {renderIcon()}
                    <span className="ml-2">{chat.client?.name || 'Cliente'}</span>
                    {chat.newClientMessagesCount > 0 && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {chat.newClientMessagesCount}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCloseDialog}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

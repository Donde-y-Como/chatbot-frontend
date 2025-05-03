import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useGetClientChats } from '../hooks/useGetClientChats';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'

interface RedirectToChatProps {
  clientId: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Componente para redirigir desde citas o eventos a una conversación de chat
 */
export function RedirectToChat({ clientId, open, onClose }: RedirectToChatProps) {
  const navigate = useNavigate();
  const { chats, isLoading, error } = useGetClientChats(open ? clientId : undefined);

  // Función para manejar la redirección a un chat específico
  const handleRedirectToChat = (chatId: string) => {
    navigate({ to: '/chats', search: { chatId } });
    onClose();
  };

  // Si se está cargando, mostrar indicador
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px]">
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Si ocurrió un error
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Error al buscar conversaciones</DialogTitle>
          </DialogHeader>
          <p className="text-destructive">Ocurrió un error al buscar las conversaciones: {error.message}</p>
          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Si no hay conversaciones
  if (!isLoading && !error && chats.length === 0 && open) {
    // Mostrar toast y cerrar el dialog
    toast.warning('No se encontraron conversaciones para este cliente.');
    onClose();
    return null;
  }

  // Si hay exactamente una conversación, redirigir automáticamente
  if (chats.length === 1) {
    handleRedirectToChat(chats[0].id);
    return null;
  }

  // Si hay múltiples conversaciones, mostrar opciones para elegir
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Selecciona una conversación</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">Este cliente tiene varias conversaciones. Selecciona una:</p>
          <div className="space-y-2">
            {chats.map(chat => (
              <Button 
                key={chat.id} 
                onClick={() => handleRedirectToChat(chat.id)} 
                variant="outline" 
                className="w-full justify-start"
              >
                {chat.client?.name} ({chat.platformName})
                {chat.newClientMessagesCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {chat.newClientMessagesCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

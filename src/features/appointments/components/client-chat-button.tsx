import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { RedirectToChat } from '@/features/chats/components/RedirectToChat';

interface ClientChatButtonProps {
  clientId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Botón que abre un modal para redireccionar a conversaciones del cliente desde una cita
 */
export function ClientChatButton({ clientId, variant = 'outline', size = 'sm' }: ClientChatButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleOpenDialog}
        className="flex items-center gap-1"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Ver chat</span>
      </Button>

      {dialogOpen && (
        <RedirectToChat 
          clientId={clientId} 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
        />
      )}
    </>
  );
}

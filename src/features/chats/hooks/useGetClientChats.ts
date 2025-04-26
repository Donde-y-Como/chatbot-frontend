import { useState, useEffect } from 'react';
import { Chat } from '../ChatTypes';
import { chatService } from '../ChatService';

/**
 * Hook para buscar conversaciones (chats) por ID de cliente
 * @param clientId ID del cliente para buscar sus conversaciones
 * @returns Lista de conversaciones del cliente
 */
export const useGetClientChats = (clientId: string | undefined) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId) {
      setChats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Función para encontrar chats por clientId
    const findChatsByClientId = async () => {
      try {
        const allChats = await chatService.getChats();
        
        // Filtrar los chats donde el cliente coincide con el clientId proporcionado
        const clientChats = allChats.filter(chat => 
          chat.client?.id === clientId
        );
        
        setChats(clientChats);
      } catch (err) {
        console.error("Error al buscar chats del cliente:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    findChatsByClientId();
  }, [clientId]);

  return { chats, isLoading, error };
};

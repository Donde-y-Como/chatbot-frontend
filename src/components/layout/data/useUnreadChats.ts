import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from '@/features/chats/ChatService.ts';
import { socket } from '@/hooks/use-web-socket.ts';
import { Chat } from '@/features/chats/ChatTypes.ts';

export function useUnreadChats() {
    const queryClient = useQueryClient();

    const getCount = useQuery({
        queryKey: ['unreadChats'],
        queryFn: async () => {
            const chats = await chatService.getChats();
            return chats.filter((chat) => chat.newClientMessagesCount > 0).length;
        }
    });

    // Escuchar eventos del socket y actualizar el recuento cuando cambie la caché de chats
    useEffect(() => {
        const updateUnreadCount = () => {
            const chats = queryClient.getQueryData<Chat[]>(['chats']);
            if (chats) {
                const count = chats.filter(chat => chat.newClientMessagesCount > 0).length;
                queryClient.setQueryData(['unreadChats'], count);
            }
        };

        const handleNewMessage = () => {
            setTimeout(() => {
                updateUnreadCount();
            }, 100); // Pequeño retraso para asegurar que la caché de chats se haya actualizado
        };

        socket.on('newClientMessage', handleNewMessage);

        const unsubscribe = queryClient.getQueryCache().subscribe(event => {
            if (event.query.queryKey[0] === 'chats' && event.type === 'updated') {
                updateUnreadCount();
            }
        });

        return () => {
            socket.off('newClientMessage', handleNewMessage);
            unsubscribe();
        };
    }, [queryClient]);

    const updateCount = useMutation({
        mutationFn: async () => {
            const chats = queryClient.getQueryData<Chat[]>(['chats']);
            if (chats) {
                const count = chats.filter(chat => chat.newClientMessagesCount > 0).length;
                return { count };
            }
            return { success: true };
        },
        onSuccess: (data) => {
            if ('count' in data) {
                queryClient.setQueryData(['unreadChats'], data.count);
            } else {
                queryClient.invalidateQueries({ queryKey: ['unreadChats'] });
            }
        },
    });

    const incrementCount = () => {
        updateCount.mutate();
    };

    const resetCount = () => {
        queryClient.setQueryData(['unreadChats'], 0);
    };

    return { 
        count: getCount.data || 0,
        isLoading: getCount.isLoading,
        incrementCount, 
        resetCount 
    };
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../../../features/chats/ChatService";

export function useUnreadChats() {
    const queryClient = useQueryClient();

    const getCount = useQuery({
        queryKey: ['unreadChats'],
        queryFn: async () => {
            const chats = await chatService.getChats();
            return chats.filter((chat) => chat.newClientMessagesCount > 0).length;
        }
    });

    const updateCount = useMutation({
        mutationFn: async () => {
            return { success: true };
        },
        onSuccess: () => {
            queryClient.setQueryData<number>(['unreadChats'], (cachedCount) => {
                return cachedCount ? cachedCount + 1 : cachedCount;
            });
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../ChatService";
import { Chat, ChatMessages } from "../ChatTypes";

export function useChatMutations() {
    const queryClient = useQueryClient();
    
    const markAsUnreadMutation = useMutation({
        mutationKey: ['mark-as-unread'],
        mutationFn: async (data: { chatId: string }) => {
            await chatService.markAsUnread(data)
        },
        onError: () => {
            
        },
        onSettled: (_data, _error, variables) => {
            queryClient.setQueryData<ChatMessages>(['chat', variables.chatId], (oldChats) => {
                if (oldChats === undefined) return oldChats
                return {
                    ...oldChats,
                    newClientMessagesCount: oldChats.newClientMessagesCount + 1,
                }
            })

            queryClient.setQueryData<Chat[]>(['chats'], (oldChats) => {
                if (oldChats === undefined) return oldChats
                return [...oldChats]
                    .map((cachedChat) => {
                        if (cachedChat.id === variables.chatId) {
                            return {
                                ...cachedChat,
                                newClientMessagesCount: cachedChat.newClientMessagesCount + 1,
                            }
                        }
                        return cachedChat
                    })
                    .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp)
            })
        }
    })

    const markAsUnread = (chatId: string) => {
        markAsUnreadMutation.mutate({ chatId })
    }

    return { markAsUnreadMutation, markAsUnread }
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClientApiService } from "../ClientApiService";
import { ScheduleClientServicesRequest } from "../types";

export function usePendingServices(clientId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['clients', clientId, 'pendingServices'],
        queryFn: () => ClientApiService.getPendingServices(clientId),
        enabled: enabled && !!clientId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useScheduleClientServices() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ clientId, request }: { 
            clientId: string; 
            request: ScheduleClientServicesRequest 
        }) => ClientApiService.scheduleClientServices(clientId, request),
        
        onSuccess: (data, variables) => {
            // Invalidate and refetch pending services for this client
            void queryClient.invalidateQueries({
                queryKey: ['clients', variables.clientId, 'pendingServices']
            });
            
            // Also invalidate appointments since new ones were created
            void queryClient.invalidateQueries({
                queryKey: ['appointments']
            });

            toast.success(data.message);
        },
        
        onError: (error: Error) => {
            toast.error(error.message || "Error al agendar los servicios");
        }
    });
}
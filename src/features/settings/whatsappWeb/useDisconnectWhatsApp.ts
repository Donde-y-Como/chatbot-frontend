import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WAAPI_CLIENT_INFO_QUERY_KEY } from "./useClientInfo";
import { WHATSAPP_QUERY_KEY } from "./useWhatsAppData";
import { useGetUser } from "../../../components/layout/hooks/useGetUser";
import { waapiService } from "./waapi-service";
import { getInstanceId } from "../../../lib/utils";

export function useDisconnectWhatsApp() {
    const { data: user } = useGetUser();
    const queryClient = useQueryClient();

    const { mutateAsync: disconnectWhatsApp } = useMutation({
        mutationFn: async () => {
            if (!user) throw Error("User not found");
            const instanceId = getInstanceId(user)!
            await waapiService.logout(instanceId);
        },
        onSuccess: () => {
            toast.success("WhatsApp desconectado");
        },
        onError: () => {
            toast.error("Error al desconectar WhatsApp");
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: WHATSAPP_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: WAAPI_CLIENT_INFO_QUERY_KEY });
        }
    });

    return {
        disconnectWhatsApp
    }
}
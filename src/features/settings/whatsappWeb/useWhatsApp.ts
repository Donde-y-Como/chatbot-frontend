import { useEffect, useState } from "react";
import { useWhatsAppData } from "./useWhatsAppData";

export function useWhatsApp() {
    const [isConnected, setIsConnected] = useState(false);
    const { data: whatsappData, isLoading } = useWhatsAppData();

    useEffect(() => {
        if (whatsappData?.instanceStatus === "ready") {
            setIsConnected(true);
        }
    }, [whatsappData])

    return {
        isConnected,
        isLoading, whatsappData
    }
}
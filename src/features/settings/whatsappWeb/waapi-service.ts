import axios from "axios";

const waapi = axios.create({ baseURL: "https://waapi.app/api/v1/instances" });

waapi.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_WAAPI_TOKEN}`
    config.headers.accept = "application/json"
    config.headers.contentType = "application/json"
    return config
})

export type WaapiClientStatus = {
    status: "success" | "error",
    instanceId: string,
    name: string,
    data: WaapiClientInfo['data'] | null,
    instanceStatus: "booting"
    | "loading_screen"
    | "qr"
    | "ready"
    | "authenticated"
    | "auth_failure"
    | "disconnected",
}

export type WaapiClientInfo = {
    status: "success" | "error",
    instanceId: string,
    data: {
        displayName: string,
        contactId: string,
        formattedNumber: string,
        profilePicUrl: string
    }
}

export type WaapiQrCode = {
    status: "success" | "error",
    instanceId: string,
    data: {
        qr: string
        qr_code: string
    }
}

export const waapiService = {
    clientStatus: async (instanceId: string): Promise<WaapiClientStatus> => {
        const response = await waapi.get<{ clientStatus: WaapiClientStatus }>(`/${instanceId}/client/status`)
        return response.data.clientStatus;
    },
    clientInfo: async (instanceId: string): Promise<WaapiClientInfo> => {
        const response = await waapi.get<{ me: WaapiClientInfo }>(`/${instanceId}/client/me`)
        return response.data.me
    },
    logout: async (instanceId: string): Promise<boolean> => {
        const response = await waapi.post(`/${instanceId}/client/action/logout`)
        return response.data.status === "success"
    },
    qr: async (instanceId: string): Promise<WaapiQrCode> => {
        const response = await waapi.get<{ qrCode: WaapiQrCode }>(`/${instanceId}/client/qr`)
        return response.data.qrCode
    }
}

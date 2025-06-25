import { api } from '@/api/axiosInstance.ts'
import { ClientPrimitives } from "./types"

export const ClientApiService = {
    findAll: async () => {
        const response = await api.get<ClientPrimitives[]>('/clients')
        if (response.status !== 200) {
            throw new Error("Error al obtener los clientes")
        }
        return response.data
    },
    findById: async (id: string) => {
        const response = await api.get<ClientPrimitives>(`/clients/${id}`)
        if (response.status !== 200) {
            throw new Error("Error al obtener el cliente")
        }
        return response.data
    },
    create: async (client: Omit<ClientPrimitives, "id" | "businessId" | "createdAt" | "updatedAt">): Promise<ClientPrimitives> => {
        const response = await api.post<ClientPrimitives>('/clients', client)
        if (response.status !== 201) {
            throw new Error("Error al crear el cliente")
        }

        return response.data
    },
    update: async (id: string, client: Partial<ClientPrimitives>) => {
        const response = await api.put<Partial<ClientPrimitives>>(`/clients/${id}`, client)
        if (response.status !== 200) {
            throw new Error("Error al actualizar el cliente")
        }
        return response.data
    },
    delete: async (id: string) => {
        const response = await api.delete(`/clients/${id}`)
        if (response.status !== 200) {
            throw new Error("Error al eliminar el cliente")
        }
    }
}
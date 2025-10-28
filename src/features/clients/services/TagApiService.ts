import { api } from '@/api/axiosInstance.ts'
import { ClientPrimitives, Tag } from "../types"

export const TagApiService = {
    findAll: async () => {
        const response = await api.get<Tag[]>('/tags')
        if (response.status !== 200) {
            throw new Error("Error al obtener los tags")
        }
        return response.data
    },
    findById: async (id: string) => {
        const response = await api.get<Tag>(`/tags/${id}`)
        if (response.status !== 200) {
            throw new Error("Error al obtener el tag")
        }
        return response.data
    },
    create: async (client: Omit<Tag, "id" | "businessId">) => {
        const response = await api.post<Omit<Tag, "id" | "businessId">>('/tags', client)
        if (response.status !== 201) {
            throw new Error("Error al crear el tag")
        }
        return response.data
    },
    update: async (tag: Partial<ClientPrimitives>) => {
        const response = await api.put<Partial<ClientPrimitives>>(`/tags/${tag.id}`, tag)
        if (response.status !== 200) {
            throw new Error("Error al actualizar el tag")
        }
        return response.data
    },
    delete: async (id: string) => {
        const response = await api.delete(`/tags/${id}`)
        if (response.status !== 200) {
            throw new Error("Error al eliminar el tag")
        }
    }
}
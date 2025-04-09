import { api } from "../../../api/axiosInstance"
import { AccountPrimitives } from "./types"

export const AccountApiService = {
    find: async () => {
        const response = await api.get<AccountPrimitives>('/whatsapp/profile')
        if (response.status >= 200 && response.status<300) {
            return response.data
        }
        throw new Error("Error al obtener el perfil")
        
    },
    update: async (account:Partial<AccountPrimitives>)=>{
        const response = await api.post<Partial<AccountPrimitives>>(`/whatsapp/profile`,account)
        if (response.status >= 200 && response.status<300){
            return response.data
        }
        throw new Error("Error al actualizar el perfil")
        
    }
}
import { useQuery } from "@tanstack/react-query";
import { ClientApiService } from "../ClientApiService";

export function useGetClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: ClientApiService.findAll,
        staleTime: Infinity,
    })
}
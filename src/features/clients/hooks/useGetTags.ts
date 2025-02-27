import { useQuery } from "@tanstack/react-query";
import { TagApiService } from "../TagApiService";

export function useGetTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: TagApiService.findAll,
        staleTime: Infinity,
    })
}
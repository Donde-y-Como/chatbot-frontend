import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TagApiService } from "../TagApiService";

export function useGetTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: TagApiService.findAll
    })
}

export function useTagMutations() {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationKey: ['tags', 'create'],
        async mutationFn({ name }: { name: string }) {
            const response = await TagApiService.create({ name })
            return response
        },
        onSuccess: () => {
            toast.success("Tag creado correctamente")
            queryClient.refetchQueries({ queryKey: ['tags'] })
        }
    })

    const create = async (name: string) => {
        await createMutation.mutateAsync({ name });
    }

    return { create, createMutation }
}
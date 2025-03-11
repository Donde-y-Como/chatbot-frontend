import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientApiService } from "@/features/clients/ClientApiService";
import { toast } from "sonner";

export function useUpdateClientTags() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      clientId,
      tagIds,
    }: {
      clientId: string;
      tagIds: string[];
    }) => {
      return await ClientApiService.update(clientId, { tagIds });
    },
    onSuccess: () => {
      toast.success("Etiquetas actualizadas correctamente");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: () => {
      toast.error("Hubo un error al actualizar las etiquetas");
    },
  });

  const updateClientTags = async (clientId: string, tagIds: string[]) => {
    await mutation.mutateAsync({ clientId, tagIds });
  };

  return { updateClientTags, isLoading: mutation.isPending };
}

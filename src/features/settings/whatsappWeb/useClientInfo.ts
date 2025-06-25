import { useQuery } from "@tanstack/react-query";
import { useGetUser } from "../../../components/layout/hooks/useGetUser";
import { waapiService } from "./waapi-service";
import { getInstanceId } from "../../../lib/utils";

export const WAAPI_CLIENT_INFO_QUERY_KEY = ['client-info'] as const;

export function useClientInfo() {
  const { data: user } = useGetUser();
  
  return useQuery({
    queryKey: [...WAAPI_CLIENT_INFO_QUERY_KEY, user],
    queryFn: async () => {
      if (!user) throw Error("User not found");
      
      return await waapiService.clientInfo(getInstanceId(user)!);
    },
    staleTime: Infinity,
    enabled: !!user
  });
}

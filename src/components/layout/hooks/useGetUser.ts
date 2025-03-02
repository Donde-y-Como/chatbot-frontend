import { useQuery } from "@tanstack/react-query";
import { authService } from "../../../features/auth/AuthService";

export function useGetUser() {
    return useQuery({
        queryKey: UserQueryKey,
        queryFn: authService.getMe,
        staleTime: Infinity,
    })
}

export const UserQueryKey = ['user'] as const;
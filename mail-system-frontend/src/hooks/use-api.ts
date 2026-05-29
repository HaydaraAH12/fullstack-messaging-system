"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function useApiQuery<TData, TError = Error>({
  requireAuth = false,
  enabled,
  ...options
}: Omit<UseQueryOptions<TData, TError>, "enabled"> & {
  enabled?: boolean;
  requireAuth?: boolean;
}) {
  const { isAuthenticated } = useAuth();

  return useQuery<TData, TError>({
    ...options,
    enabled: (requireAuth ? isAuthenticated : true) && (enabled ?? true),
  });
}

export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>) {
  return useMutation<TData, TError, TVariables, TContext>(options);
}

export function useInvalidateApi() {
  const queryClient = useQueryClient();

  return {
    invalidate: (queryKey: QueryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    remove: (queryKey: QueryKey) => queryClient.removeQueries({ queryKey }),
    reset: () => queryClient.clear(),
  };
}

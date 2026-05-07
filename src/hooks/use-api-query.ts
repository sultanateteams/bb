import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "../lib/axios";
import { ApiResponse, ApiError } from "../types/api";

// GET so'rovlar uchun wrapper
export const useApiQuery = <T>(
  key: any[],
  url: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ApiResponse<T>, ApiError>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get(url);
      return data;
    },
    ...options,
  });
};

// POST, PUT, DELETE so'rovlar uchun wrapper
export const useApiMutation = <T, V>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: UseMutationOptions<ApiResponse<T>, ApiError, V>
) => {
  return useMutation<ApiResponse<T>, ApiError, V>({
    mutationFn: async (payload: V) => {
      const { data } = await apiClient[method](url, payload);
      return data;
    },
    ...options,
  });
};
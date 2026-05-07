import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { LoginRequest, LoginResult } from "@/types/auth";
import { ApiError, ApiResponse } from "@/types/api";

/**
 * Hook: Login mutation
 * Encapsulates authentication logic: service call + store update + navigation
 */
export function useLoginMutation() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation<ApiResponse<LoginResult>, ApiError, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      const { access_token, refresh_token, user } = data.result;
      setCredentials({
        token: access_token,
        refreshToken: refresh_token,
        user,
      });
      navigate("/dashboard", { replace: true });
    },
  });
}
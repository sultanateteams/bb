import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/auth.service";
import { LoginRequest, LoginResult } from "@/types/auth";
import { ApiError, ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Hook: Login mutation
 * Uses auth.service.ts layer for API communication.
 */
export const useLogin = () => {
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
};

export const normalizeApiError = (error: ApiError) => {
  return {
    message: error.message || "Server bilan bog'lanishda xatolik yuz berdi",
    errors: error.errors ?? {},
  };
};

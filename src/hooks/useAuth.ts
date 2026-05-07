import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  LoginRequest,
  LoginResult,
  ApiLoginResponse,
  AuthUser,
} from "@/types/auth";
import { ApiError, ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Transform API login response to internal auth format
 */
function transformApiLoginResponse(apiResponse: ApiLoginResponse): LoginResult {
  const user: AuthUser = {
    id: apiResponse.user_id,
    firstName: apiResponse.first_name,
    lastName: apiResponse.last_name,
    avatar: apiResponse.avatar,
    user_type: apiResponse.user_type,
  };

  return {
    access_token: apiResponse.token,
    refresh_token: "", // API doesn't return refresh token, use empty string
    user,
  };
}

export const useLogin = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation<ApiResponse<LoginResult>, ApiError, LoginRequest>({
    mutationFn: async (payload) => {
      console.log("Login payload:", payload); // Debug log for login payload
      console.log("API URL:", apiClient.defaults.baseURL); // Debug log for API URL
      console.log("API Headers:", import.meta.env.VITE_APP_API); // Debug log for API headers

      const { data } = await apiClient.post<ApiResponse<ApiLoginResponse>>(
        "/site/auth",
        payload,
      );
      // Transform the API response to our internal format
      const transformedResult = transformApiLoginResponse(data.result);
      return {
        ...data,
        result: transformedResult,
      };
    },
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

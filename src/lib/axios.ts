import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStore } from "@/store/useAuthStore";
import { ApiError, ApiResponse } from "@/types/api";
import { RefreshResult } from "@/types/auth";

const API_URL = import.meta.env.VITE_APP_API || "https://apis.abs-software.uz";

let isRefreshing = false;

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject: (error: ApiError | any) => void;
};

let failedQueue: RefreshQueueItem[] = [];

const processQueue = (error: ApiError | null, token: string | null = null) => {
  failedQueue.forEach((queueItem) => {
    if (error) queueItem.reject(error);
    else queueItem.resolve(token as string);
  });
  failedQueue = [];
};

const createApiError = (error: AxiosError<any>): ApiError => ({
  message:
    error.response?.data?.message ||
    error.message ||
    "Noma'lum xatolik yuz berdi",
  status: error.response?.status,
  errors: error.response?.data?.errors,
});

const getAuthToken = () => {
  try {
    return authStore.getState().token;
  } catch {
    return null;
  }
};

const getRefreshToken = () => {
  try {
    return authStore.getState().refreshToken;
  } catch {
    return null;
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json", "Accept-Language": "uz" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();

  if (!config.headers) {
    config.headers = {};
  }

  const headers = config.headers as Record<string, string>;
  headers["Accept-Language"] = "uz";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Check if API returned error in response body (code field indicates error)
    const data = response.data as any;
    if (data?.code && data.code >= 400) {
      // Treat as API error
      const error: ApiError = {
        message: data.message || "Xatolik yuz berdi",
        status: data.code,
      };
      return Promise.reject(error);
    }
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        try {
          authStore.getState().logout();
        } catch {}
        return Promise.reject(createApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              const headers = originalRequest.headers as Record<string, string>;
              headers["Authorization"] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<ApiResponse<RefreshResult>>(
          `${API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": "uz",
            },
          },
        );

        const { access_token, refresh_token, user } = data.result;
        authStore.getState().setCredentials({
          token: access_token,
          refreshToken: refresh_token,
          user,
        });
        processQueue(null, access_token);

        if (originalRequest.headers) {
          const headers = originalRequest.headers as Record<string, string>;
          headers["Authorization"] = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        const apiError = createApiError(refreshError as AxiosError<any>);
        processQueue(apiError, null);
        try {
          authStore.getState().logout();
        } catch {}
        return Promise.reject(apiError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(createApiError(error));
  },
);

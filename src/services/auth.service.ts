import { httpClient } from "@/services/httpClient";
import {
  LoginRequest,
  LoginResult,
  ApiLoginResponse,
  AuthUser,
} from "@/types/auth";
import { ApiResponse } from "@/types/api";

/**
 * Transform raw API login response to internal auth format
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
    refresh_token: "", // API doesn't return refresh token
    user,
  };
}

/**
 * Authenticate user with login/password
 * POST /site/auth
 */
export async function login(
  payload: LoginRequest,
): Promise<ApiResponse<LoginResult>> {
  const { data } = await httpClient.post<ApiResponse<ApiLoginResponse>>(
    "/site/auth",
    payload,
  );

  const transformedResult = transformApiLoginResponse(data.result);

  return {
    ...data,
    result: transformedResult,
  };
}
import { httpClient } from "@/services/httpClient";
import { LoginRequest, LoginResult, AuthUser } from "@/types/auth";
import { ApiResponse } from "@/types/api";

type BackendSignInData = {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    role: string;
    is_active: boolean;
    login?: string | null;
    phone?: string | null;
  };
  token: string;
};

type BackendSignInResp = {
  data: BackendSignInData;
  status: number;
  message?: string;
  error?: string;
};

/**
 * POST /auth/sign-in
 * Backend response: { data: { user: UserResp, token: string }, status: 200 }
 */
export async function login(
  payload: LoginRequest,
): Promise<ApiResponse<LoginResult>> {
  const { data } = await httpClient.post<BackendSignInResp>("/auth/sign-in", {
    login: payload.login,
    password: payload.password,
  });

  if (data.error || !data.data) {
    throw { message: data.error || "Login xatolik", status: data.status };
  }

  const rawUser = data.data.user;
  const user: AuthUser = {
    id: rawUser.id,
    firstName: rawUser.first_name,
    lastName: rawUser.last_name,
    role: rawUser.role,
    user_type: rawUser.role,
  };

  return {
    success: true,
    result: {
      access_token: data.data.token,
      refresh_token: "",
      user,
    },
  };
}

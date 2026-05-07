export type UserType = "CEO" | "DILER" | "DOKON" | "SAVDO_VAKILI" | "HAYDOVCHI" | "admin" | string;

export interface AuthUser {
  id: number;
  login?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
  user_type: UserType;
}

/** API Response from /site/auth endpoint */
export interface ApiLoginResponse {
  avatar: string;
  date: string;
  department_ids: null | any;
  dlp_id: number;
  first_name: string;
  last_name: string;
  modules?: Array<any>;
  time: string;
  user_id: number;
  user_type: string;
  token: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

/** Expected after transformation */
export interface LoginResult {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface RefreshResult {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface AuthResponse<T = LoginResult> {
  success: boolean;
  message?: string;
  result: T;
}

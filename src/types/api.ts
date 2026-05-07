export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  result: T;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}
import { httpClient } from "@/services/httpClient";
import { ApiResponse } from "@/types/api";
import type { Employee } from "@/pages/CEO/types";

/**
 * Fetch all employees
 * GET /users
 */
export async function getEmployees(): Promise<ApiResponse<Employee[]>> {
  const { data } = await httpClient.get<ApiResponse<Employee[]>>("/admin/users");
  return data;
}

/**
 * Create or update an employee
 * POST /site/employees
 */
export async function upsertEmployee(
  payload: Partial<Employee>,
): Promise<ApiResponse<Employee>> {
  const { data } = await httpClient.post<ApiResponse<Employee>>(
    "/site/employees",
    payload,
  );
  return data;
}

/**
 * Delete an employee by ID
 * DELETE /site/employees
 * Payload: { id: number }
 */
export async function deleteEmployee(payload: {
  id: number;
}): Promise<ApiResponse<any>> {
  const { data } = await httpClient.delete<ApiResponse<any>>(
    "/site/employees",
    { data: payload },
  );
  return data;
}

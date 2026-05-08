import { httpClient } from "@/services/httpClient";
import type { Employee } from "@/pages/CEO/types";
type BackendResponse<T> = { data: T; status: number; message?: string; error?: string };
type RawUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  pinfl?: string | null;
  phone?: string | null;
  login?: string | null;
  role?: string | null;
};

const mapFromBackend = (u: RawUser): Employee => ({
  id: u.id,
  firstName: u.first_name || "",
  lastName: u.last_name || "",
  middleName: u.middle_name || undefined,
  pinfl: u.pinfl || "",
  phone: u.phone || "",
  position: u.role === "admin" ? "Admin" : "Operator",
  systemLogin: u.login || undefined,
  role: u.role === "admin" ? "Admin" : "Operator",
});

const mapToBackend = (payload: Partial<Employee>, isNew = false) => ({
  first_name: payload.firstName,
  last_name: payload.lastName,
  middle_name: payload.middleName || null,
  pinfl: payload.pinfl || null,
  phone: payload.phone || null,
  login: payload.systemLogin || null,
  role: payload.role ? payload.role.toLowerCase() : undefined,
  ...(isNew ? { password: "secret123" } : {}),
});

/**
 * Fetch all employees
 * GET /users
 */
export async function getEmployees(): Promise<BackendResponse<Employee[]>> {
  const { data } = await httpClient.get<BackendResponse<RawUser[]>>("/users");
  return { ...data, data: (data.data || []).map(mapFromBackend) };
}

/**
 * Create or update an employee
 * POST /site/employees
 */
export async function upsertEmployee(
  payload: Partial<Employee>,
): Promise<BackendResponse<Employee>> {
  const isNew = !payload.id;
  const body = mapToBackend(payload, isNew);

  const { data } = isNew
    ? await httpClient.post<BackendResponse<RawUser>>("/users/", body)
    : await httpClient.put<BackendResponse<RawUser>>(`/users/${payload.id}`, body);

  return { ...data, data: mapFromBackend(data.data) };
}

/**
 * Delete an employee by ID
 * DELETE /site/employees
 * Payload: { id: number }
 */
export async function deleteEmployee(payload: {
  id: number;
}): Promise<BackendResponse<any>> {
  const { data } = await httpClient.delete<BackendResponse<any>>(
    `/users/${payload.id}`,
  );
  return data;
}

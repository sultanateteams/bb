import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  upsertEmployee,
  deleteEmployee,
} from "@/services/employee.service";
import { Employee } from "@/pages/CEO/types";
import { ApiError } from "@/types/api";
type BackendResponse<T> = { data: T; status: number; message?: string; error?: string };

export const EMPLOYEES_QUERY_KEY = ["employees"];

/**
 * Hook: Fetch all employees
 */
export function useEmployeesQuery() {
  return useQuery<BackendResponse<Employee[]>, ApiError>({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: getEmployees,
  });
}

/**
 * Hook: Create or update an employee
 */
export function useUpsertEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Employee>, ApiError, Partial<Employee>>({
    mutationFn: upsertEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}

/**
 * Hook: Delete an employee by ID
 */
export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<any>, ApiError, { id: number }>({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}

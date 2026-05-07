import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  upsertEmployee,
  deleteEmployee,
} from "@/services/employee.service";
import { Employee } from "@/pages/CEO/types";
import { ApiResponse, ApiError } from "@/types/api";

export const EMPLOYEES_QUERY_KEY = ["employees"];

/**
 * Hook: Fetch all employees
 */
export function useEmployeesQuery() {
  return useQuery<ApiResponse<Employee[]>, ApiError>({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: getEmployees,
  });
}

/**
 * Hook: Create or update an employee
 */
export function useUpsertEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Employee>, ApiError, Partial<Employee>>({
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

  return useMutation<ApiResponse<any>, ApiError, { id: number }>({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}
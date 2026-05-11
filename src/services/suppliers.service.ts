import { httpClient } from "@/services/httpClient";

type BackendResponse<T> = { data: T; status: number; message?: string; error?: string };

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  address?: string;
  inn?: string;
  note?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierPayload {
  name: string;
  phone: string;
  address?: string;
  inn?: string;
  note?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  phone?: string;
  address?: string;
  inn?: string;
  note?: string;
  is_active?: boolean;
}

export async function getSuppliers(params?: { search?: string; is_active?: boolean }) {
  const { data } = await httpClient.get<BackendResponse<Supplier[]>>("/suppliers", { params });
  return data.data || [];
}

export async function createSupplier(payload: CreateSupplierPayload) {
  const { data } = await httpClient.post<BackendResponse<Supplier>>("/suppliers", payload);
  return data.data;
}

export async function updateSupplier(id: number, payload: UpdateSupplierPayload) {
  const { data } = await httpClient.put<BackendResponse<Supplier>>(`/suppliers/${id}`, payload);
  return data.data;
}

export async function deleteSupplier(id: number) {
  return httpClient.delete(`/suppliers/${id}`);
}

import { httpClient } from "@/services/httpClient";

type BackendResp<T> = { data: T; status: number; message?: string; error?: string };

export interface TmPurchaseItemReq {
  product_type_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface CreateTmPurchasePayload {
  supplier_id: number;
  items: TmPurchaseItemReq[];
  paid_amount: number;
  payment_method: string;
  payment_due_date?: string;
  notes?: string;
}

export interface AddTmTransactionPayload {
  amount: number;
  payment_method: string;
  payment_date?: string;
  notes?: string;
}

export interface TmPurchaseItemResp {
  id: number;
  product_type_id: number;
  product_type_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface TmTransactionResp {
  id: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface TmPurchaseResp {
  id: number;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  payment_due_date?: string;
  notes?: string;
  items: TmPurchaseItemResp[];
  transactions: TmTransactionResp[];
  created_at: string;
  updated_at: string;
}

export interface TmPurchaseListItem {
  id: number;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  payment_due_date?: string;
  item_count: number;
  created_at: string;
}

export interface TmPurchasesListResp {
  purchases: TmPurchaseListItem[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

export async function getTmPurchases(params?: {
  page?: number;
  limit?: number;
  supplier_id?: number;
  search?: string;
  only_with_debt?: boolean;
}): Promise<TmPurchasesListResp> {
  const { data } = await httpClient.get<BackendResp<TmPurchasesListResp>>("/tm-purchases", { params });
  return data.data;
}

export async function getTmPurchaseByID(id: number): Promise<TmPurchaseResp> {
  const { data } = await httpClient.get<BackendResp<TmPurchaseResp>>(`/tm-purchases/${id}`);
  return data.data;
}

export async function createTmPurchase(payload: CreateTmPurchasePayload): Promise<TmPurchaseResp> {
  const { data } = await httpClient.post<BackendResp<TmPurchaseResp>>("/tm-purchases", payload);
  return data.data;
}

export async function deleteTmPurchase(id: number): Promise<void> {
  await httpClient.delete(`/tm-purchases/${id}`);
}

export async function addTmTransaction(
  purchaseId: number,
  payload: AddTmTransactionPayload,
): Promise<TmTransactionResp> {
  const { data } = await httpClient.post<BackendResp<TmTransactionResp>>(
    `/tm-purchases/${purchaseId}/transactions`,
    payload,
  );
  return data.data;
}

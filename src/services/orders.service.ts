import { httpClient } from "@/services/httpClient";

type BackendResp<T> = { data: T; status: number; message?: string; error?: string };

export interface OrderListItem {
  id: number;
  order_number: string;
  order_date: string;
  agent_id: number;
  agent_name: string;
  shop_id: number;
  shop_name: string;
  region: string;
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  status: string;
}

export interface OrdersListResp {
  orders: OrderListItem[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

export interface CreateOrderPayload {
  order_date: string;
  order_number: string;
  agent_id: number;
  shop_id: number;
  items: { product_type_id: number; quantity: number; unit_price: number; notes?: string }[];
  paid_amount: number;
  payment_method: "cash" | "terminal" | "transfer";
  notes?: string;
}

export async function getOrders(params?: {
  page?: number;
  limit?: number;
  agent_id?: number;
  shop_id?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}): Promise<OrdersListResp> {
  const { data } = await httpClient.get<BackendResp<OrdersListResp>>("/orders", { params });
  return data.data;
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await httpClient.post<BackendResp<any>>("/orders", payload);
  return data.data;
}

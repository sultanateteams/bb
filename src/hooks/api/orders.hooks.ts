import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addOrderTransaction, createOrder, getOrderByID, getOrders, type AddOrderTransactionPayload, type CreateOrderPayload } from "@/services/orders.service";

export const ORDERS_KEY = ["orders"];

export function useOrdersQuery(params?: {
  page?: number;
  limit?: number;
  agent_id?: number;
  shop_id?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: [...ORDERS_KEY, params],
    queryFn: () => getOrders(params),
  });
}

export function useCreateOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}

export function useOrderByIDQuery(id: number) {
  return useQuery({
    queryKey: [...ORDERS_KEY, "detail", id],
    queryFn: () => getOrderByID(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useAddOrderTransactionMutation(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddOrderTransactionPayload) => addOrderTransaction(orderId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ORDERS_KEY, "detail", orderId] });
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}
